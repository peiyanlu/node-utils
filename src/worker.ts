import { isZero } from '@peiyanlu/ts-utils'
import { Worker } from 'node:worker_threads'


/** 运行 worker */
export const runWorker = <T, R>(file: string, data: T, useEval: boolean = false): Promise<R> =>
  new Promise((resolve, reject) => {
    const worker = new Worker(file, {
      eval: useEval,
      workerData: data,
    })
    
    worker.once('message', resolve)
    
    worker.once('error', reject)
    
    worker.once('exit', code => {
      if (!isZero(code)) {
        reject(new Error(`Worker stopped with ${ code }`))
      }
    })
  })
