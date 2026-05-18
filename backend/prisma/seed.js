const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  // Admin user
  const adminEmail = process.env.ADMIN_SEED_EMAIL || 'admin@edudiscount.com'
  const adminPassword = process.env.ADMIN_SEED_PASSWORD || 'Admin@123'
  const passwordHash = await bcrypt.hash(adminPassword, 10)

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: { email: adminEmail, passwordHash },
  })
  console.log(`Admin created: ${adminEmail}`)

  // Schools
  const schools = [
    { name: 'Cairo International School', nameAr: 'مدرسة القاهرة الدولية', language: 'English' },
    { name: 'Nile Academy', nameAr: 'أكاديمية النيل', language: 'Arabic' },
    { name: 'Delta STEM School', nameAr: 'مدرسة دلتا للعلوم والتقنية', language: 'Arabic' },
  ]

  const subjects = [
    { name: 'Mathematics', nameAr: 'الرياضيات' },
    { name: 'Science', nameAr: 'العلوم' },
    { name: 'English', nameAr: 'اللغة الإنجليزية' },
  ]

  const teachersBySubject = {
    Mathematics: [
      { name: 'Mr. Ahmed Khalil', nameAr: 'أ. أحمد خليل', coursePrice: 50000, discountPct: 25 },
      { name: 'Ms. Nour Hassan', nameAr: 'أ. نور حسن', coursePrice: 40000, discountPct: 20 },
    ],
    Science: [
      { name: 'Dr. Karim Adel', nameAr: 'د. كريم عادل', coursePrice: 60000, discountPct: 15 },
      { name: 'Ms. Sara Mahmoud', nameAr: 'أ. سارة محمود', coursePrice: 45000, discountPct: 10 },
    ],
    English: [
      { name: 'Mr. Omar Fathy', nameAr: 'أ. عمر فتحي', coursePrice: 35000, discountPct: 20 },
      { name: 'Ms. Layla Ibrahim', nameAr: 'أ. ليلى إبراهيم', coursePrice: 38000, discountPct: 15 },
      { name: 'Mr. Ziad Nasser', nameAr: 'أ. زياد ناصر', coursePrice: 42000, discountPct: 25 },
    ],
  }

  for (const schoolData of schools) {
    const school = await prisma.school.upsert({
      where: { name: schoolData.name },
      update: {},
      create: { name: schoolData.name, nameAr: schoolData.nameAr, language: schoolData.language },
    })
    console.log(`School: ${school.name}`)

    for (const subjectData of subjects) {
      let subject = await prisma.subject.findFirst({
        where: { schoolId: school.id, name: subjectData.name },
      })
      if (!subject) {
        subject = await prisma.subject.create({
          data: { schoolId: school.id, name: subjectData.name, nameAr: subjectData.nameAr },
        })
      }
      console.log(`  Subject: ${subject.name}`)

      const teachers = teachersBySubject[subjectData.name] || []
      for (const t of teachers) {
        const existing = await prisma.teacher.findFirst({
          where: { subjectId: subject.id, name: t.name },
        })
        if (!existing) {
          await prisma.teacher.create({
            data: {
              subjectId: subject.id,
              name: t.name,
              nameAr: t.nameAr,
              platformTeacherId: `mock-${t.name.toLowerCase().replace(/\s/g, '-')}`,
              coursePrice: t.coursePrice,
              discountPct: t.discountPct,
            },
          })
        }
        console.log(`    Teacher: ${t.name} — ${t.coursePrice / 100} EGP, ${t.discountPct}% off`)
      }
    }
  }

  console.log('\nSeed complete.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
