import { useTranslation } from 'react-i18next'

const STEPS = ['school', 'subject', 'teacher', 'code']

export default function StepProgress({ currentStep }) {
  const { t } = useTranslation()

  return (
    <div className="flex items-center justify-center gap-1 mb-8">
      {STEPS.map((step, idx) => {
        const stepNum = idx + 1
        const isActive = currentStep === stepNum
        const isDone = currentStep > stepNum

        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all
                  ${isDone ? 'bg-teal text-white' : isActive ? 'bg-navy text-white ring-2 ring-teal ring-offset-2' : 'bg-gray-200 text-gray-400'}`}
              >
                {isDone ? '✓' : stepNum}
              </div>
              <span className={`text-xs mt-1 font-medium ${isActive ? 'text-navy' : isDone ? 'text-teal' : 'text-gray-400'}`}>
                {t(`steps.${step}`)}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`w-10 h-0.5 mx-1 mb-5 ${currentStep > stepNum ? 'bg-teal' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
