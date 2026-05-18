const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

const SCHOOLS = [
  {
    name: 'Cairo International School',
    nameAr: 'مدرسة القاهرة الدولية',
    language: 'English',
    subjects: [
      {
        name: 'Mathematics', nameAr: 'الرياضيات',
        teachers: [
          { name: 'Mr. Ahmed Khalil',  nameAr: 'أ. أحمد خليل',   coursePrice: 50000, discountPct: 25 },
          { name: 'Ms. Nour Hassan',   nameAr: 'أ. نور حسن',     coursePrice: 40000, discountPct: 20 },
        ],
      },
      {
        name: 'Physics', nameAr: 'الفيزياء',
        teachers: [
          { name: 'Dr. James Wilson',  nameAr: 'د. جيمس ويلسون', coursePrice: 60000, discountPct: 15 },
          { name: 'Ms. Emma Davis',    nameAr: 'أ. إيما ديفيس',   coursePrice: 55000, discountPct: 20 },
        ],
      },
      {
        name: 'Chemistry', nameAr: 'الكيمياء',
        teachers: [
          { name: 'Dr. Sara Mahmoud', nameAr: 'د. سارة محمود',   coursePrice: 58000, discountPct: 15 },
          { name: 'Mr. Karim Adel',   nameAr: 'أ. كريم عادل',    coursePrice: 52000, discountPct: 10 },
        ],
      },
      {
        name: 'English Literature', nameAr: 'الأدب الإنجليزي',
        teachers: [
          { name: 'Mr. Omar Fathy',   nameAr: 'أ. عمر فتحي',     coursePrice: 35000, discountPct: 20 },
          { name: 'Ms. Layla Ibrahim',nameAr: 'أ. ليلى إبراهيم', coursePrice: 38000, discountPct: 25 },
        ],
      },
      {
        name: 'Biology', nameAr: 'الأحياء',
        teachers: [
          { name: 'Ms. Christine George', nameAr: 'أ. كريستين جورج', coursePrice: 49000, discountPct: 15 },
        ],
      },
    ],
  },
  {
    name: 'Nile Academy',
    nameAr: 'أكاديمية النيل',
    language: 'Arabic',
    subjects: [
      {
        name: 'Mathematics', nameAr: 'الرياضيات',
        teachers: [
          { name: 'Mr. Abdulrahman Mohamed', nameAr: 'أ. عبدالرحمن محمد', coursePrice: 45000, discountPct: 20 },
          { name: 'Ms. Mona Hussein',         nameAr: 'أ. منى حسين',       coursePrice: 38000, discountPct: 15 },
        ],
      },
      {
        name: 'Science', nameAr: 'العلوم',
        teachers: [
          { name: 'Mr. Hisham El-Gendy', nameAr: 'أ. هشام الجندي', coursePrice: 42000, discountPct: 20 },
          { name: 'Ms. Rania Salem',      nameAr: 'أ. رانيا سالم',   coursePrice: 40000, discountPct: 15 },
        ],
      },
      {
        name: 'Arabic Language', nameAr: 'اللغة العربية',
        teachers: [
          { name: 'Ms. Samar Abdullah', nameAr: 'أ. سمر عبدالله', coursePrice: 30000, discountPct: 20 },
          { name: 'Mr. Tarek Mostafa',  nameAr: 'أ. طارق مصطفى', coursePrice: 32000, discountPct: 25 },
        ],
      },
      {
        name: 'History & Geography', nameAr: 'التاريخ والجغرافيا',
        teachers: [
          { name: 'Dr. Nadia Rashad', nameAr: 'د. نادية رشاد', coursePrice: 35000, discountPct: 10 },
          { name: 'Mr. Rami Saleh',   nameAr: 'أ. رامي صالح',   coursePrice: 33000, discountPct: 15 },
        ],
      },
    ],
  },
  {
    name: 'Delta STEM School',
    nameAr: 'مدرسة دلتا للعلوم والتقنية',
    language: 'Arabic',
    subjects: [
      {
        name: 'Mathematics', nameAr: 'الرياضيات',
        teachers: [
          { name: 'Mr. Mahmoud Ali', nameAr: 'أ. محمود علي',    coursePrice: 50000, discountPct: 25 },
          { name: 'Mr. Peter Hanna', nameAr: 'أ. بيتر حنا',      coursePrice: 48000, discountPct: 20 },
        ],
      },
      {
        name: 'Physics', nameAr: 'الفيزياء',
        teachers: [
          { name: 'Dr. Alaa El-Din', nameAr: 'د. علاء الدين',   coursePrice: 60000, discountPct: 20 },
          { name: 'Ms. Mariam Fawzy', nameAr: 'أ. مريم فوزي',   coursePrice: 55000, discountPct: 15 },
        ],
      },
      {
        name: 'Computer Science', nameAr: 'علوم الحاسب',
        teachers: [
          { name: 'Mr. Ahmed Sami',        nameAr: 'أ. أحمد سامي',        coursePrice: 45000, discountPct: 25 },
          { name: 'Ms. Christine Naguib',   nameAr: 'أ. كريستين نجيب',    coursePrice: 42000, discountPct: 20 },
        ],
      },
      {
        name: 'Engineering', nameAr: 'الهندسة',
        teachers: [
          { name: 'Dr. Ibrahim Hassan',  nameAr: 'د. إبراهيم حسن',   coursePrice: 58000, discountPct: 15 },
          { name: 'Mr. Michael Girgis',  nameAr: 'أ. مايكل جرجس',   coursePrice: 56000, discountPct: 10 },
        ],
      },
    ],
  },
]

async function main() {
  // Admin user
  const adminEmail = process.env.ADMIN_SEED_EMAIL || 'admin@edudiscount.com'
  const adminPassword = process.env.ADMIN_SEED_PASSWORD || 'Admin@123'
  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: { email: adminEmail, passwordHash: await bcrypt.hash(adminPassword, 10) },
  })
  console.log(`Admin: ${adminEmail}`)

  for (const schoolData of SCHOOLS) {
    const school = await prisma.school.upsert({
      where: { name: schoolData.name },
      update: {},
      create: { name: schoolData.name, nameAr: schoolData.nameAr, language: schoolData.language },
    })
    console.log(`\nSchool: ${school.name}`)

    // Remove stale subjects not in current seed (cascades to teachers)
    const expectedSubjectNames = schoolData.subjects.map((s) => s.name)
    await prisma.subject.deleteMany({
      where: { schoolId: school.id, name: { notIn: expectedSubjectNames } },
    })

    for (const subjectData of schoolData.subjects) {
      let subject = await prisma.subject.findFirst({ where: { schoolId: school.id, name: subjectData.name } })
      if (!subject) {
        subject = await prisma.subject.create({
          data: { schoolId: school.id, name: subjectData.name, nameAr: subjectData.nameAr },
        })
      }
      console.log(`  Subject: ${subject.name}`)

      // Remove stale teachers not in current seed
      const expectedTeacherNames = subjectData.teachers.map((t) => t.name)
      await prisma.teacher.deleteMany({
        where: { subjectId: subject.id, name: { notIn: expectedTeacherNames } },
      })

      for (const t of subjectData.teachers) {
        const existing = await prisma.teacher.findFirst({ where: { subjectId: subject.id, name: t.name } })
        if (!existing) {
          await prisma.teacher.create({
            data: {
              subjectId: subject.id,
              name: t.name,
              nameAr: t.nameAr,
              platformTeacherId: `mock-${t.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
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
