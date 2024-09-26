'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import Image from 'next/image'

export function RsvpSida() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [additionalGuests, setAdditionalGuests] = useState(0)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    // Här skulle du vanligtvis skicka formulärdata till en server
    setIsSubmitted(true)
  }

  const renderAdditionalGuestFields = (index: number) => (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="space-y-4 mt-4 p-4 border border-pink-200 rounded-md"
    >
      <h3 className="font-semibold">Ytterligare gäst {index + 1}</h3>
      <div className="space-y-2">
        <Label htmlFor={`guest-name-${index}`}>Namn</Label>
        <Input id={`guest-name-${index}`} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`guest-specialkost-${index}`}>Specialkost</Label>
        <Textarea id={`guest-specialkost-${index}`} placeholder="Ange eventuella matpreferenser eller allergier" />
      </div>
      <div className="space-y-2">
        <Label>Behöver boende?</Label>
        <RadioGroup defaultValue="nej" className="flex space-x-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="ja" id={`guest-boende-ja-${index}`} />
            <Label htmlFor={`guest-boende-ja-${index}`}>Ja</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="nej" id={`guest-boende-nej-${index}`} />
            <Label htmlFor={`guest-boende-nej-${index}`}>Nej</Label>
          </div>
        </RadioGroup>
      </div>
    </motion.div>
  )

  if (isSubmitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center min-h-screen bg-pink-50"
      >
        <Image
          src="/Inbjudan_bild.png"
          alt="Tack"
          width={300}
          height={600}
          className="mb-8"
        />
        <h2 className="text-3xl font-bold text-pink-800">Tack för din anmälan</h2>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-pink-50 flex flex-col items-center justify-center p-4">
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
          className="text-3xl font-bold text-center mb-6 text-pink-800"
        >
          Bröllops OSA
        </motion.h1>
        <motion.form 
          onSubmit={handleSubmit} 
          className="space-y-6"
        >
          {[
            { id: 'name', label: 'Namn', type: 'input' },
            { id: 'email', label: 'E-post', type: 'input', inputType: 'email' },
            { id: 'attendance', label: 'Kommer du att närvara?', type: 'radio', options: ['Ja', 'Nej'] },
            { id: 'specialkost', label: 'Specialkost', type: 'textarea', placeholder: 'Ange eventuella matpreferenser eller allergier' },
            { id: 'boende', label: 'Behöver du boende?', type: 'radio', options: ['Ja', 'Nej'] },
            { id: 'additional-guests', label: 'Vill du anmäla någon till?', type: 'select', options: ['0', '1', '2', '3', '4'] },
          ].map((field, index) => (
            <motion.div
              key={field.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="space-y-2"
            >
              <Label htmlFor={field.id}>{field.label}</Label>
              {field.type === 'input' && (
                <Input id={field.id} type={field.inputType || 'text'} required />
              )}
              {field.type === 'textarea' && (
                <Textarea id={field.id} placeholder={field.placeholder} />
              )}
              {field.type === 'radio' && field.options && (
                <RadioGroup defaultValue={field.options[1].toLowerCase()} className="flex space-x-4">
                  {field.options.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.toLowerCase()} id={`${field.id}-${option.toLowerCase()}`} />
                      <Label htmlFor={`${field.id}-${option.toLowerCase()}`}>{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
              {field.type === 'select' && field.options && (
                <Select onValueChange={(value) => setAdditionalGuests(Number(value))}>
                  <SelectTrigger id={field.id}>
                    <SelectValue placeholder="Välj antal" />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </motion.div>
          ))}
          {[...Array(additionalGuests)].map((_, index) => renderAdditionalGuestFields(index))}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <Button type="submit" className="w-full bg-pink-500 hover:bg-pink-600 text-white">Skicka OSA</Button>
          </motion.div>
        </motion.form>
      </motion.div>
    </div>
  )
}