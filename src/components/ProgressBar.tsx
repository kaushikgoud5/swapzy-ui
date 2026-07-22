import { motion } from 'framer-motion'

function ProgressBar(props : {currentStep : number, totalSteps : number}) {
      const progress = ((props.currentStep + 1) / props.totalSteps) * 100;
  return (
    <div>
      <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">
                Step {props.currentStep} of {props.totalSteps}
              </span>
              <span className="text-sm text-purple-600">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
    </div>
  )
}

export default ProgressBar
