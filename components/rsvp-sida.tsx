'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

export function RsvpSida() {
  return (
    <div className="min-h-screen bg-pastel-purple-50 flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-lg shadow-md p-8"
      >
        <Image
          src="/Anteckning_18_mars_2024.PNG"
          alt="Emil & Mathilda"
          width={400}
          height={200}
          className="object-contain"
        />
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-2xl font-bold text-center mb-6 text-pastel-purple-400 bg-pastel-purple-50 bg-opacity-200 p-4 rounded-lg"
        >
          Tyvärr har sista datum för att OSA redan varit
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-center text-black mb-4 italic"
        >
          Vänliga hälsningar Mathilda & Emil
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="flex justify-center mt-2"
        >
          <Image
            src="/Inbjudan_bild.png"
            alt="Inbjudan"
            width={300}
            height={600}
            className="object-contain"
          />
        </motion.div>
      </motion.div>
    </div>
  )
}