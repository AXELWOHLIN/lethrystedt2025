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
import { db } from '../lib/firebase'
import { collection, addDoc } from 'firebase/firestore'

export function RsvpSida() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [additionalGuests, setAdditionalGuests] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const form = event.currentTarget
    const formData = new FormData(form)

    try {
      // Main respondent data
      const mainRespondent = {
        name: formData.get('name') as string || '',
        email: formData.get('email') as string || '',
        boende: formData.get('boende') as string || '',
        specialkost: formData.get('specialkost') as string || '',
        isMainRespondent: true,
        timestamp: new Date(),
      }

      // Log the main respondent data for debugging
      console.log('Main Respondent Data:', mainRespondent)

      // Check if required fields are filled
      if (!mainRespondent.name || !mainRespondent.email) {
        throw new Error('Namn och e-post är obligatoriska fält.')
      }

      // Add main respondent to Firestore
      await addDoc(collection(db, 'replies'), mainRespondent)

      // Handle additional guests
      for (let i = 0; i < additionalGuests; i++) {
        const additionalGuest = {
          name: formData.get(`guest-name-${i}`) as string || '',
          specialkost: formData.get(`guest-specialkost-${i}`) as string || '',
          boende: formData.get(`guest-boende-${i}`) as string || '',
          isMainRespondent: false,
          email: mainRespondent.email,
          timestamp: new Date(),
        }

        // Log the additional guest data for debugging
        console.log(`Additional Guest ${i + 1} Data:`, additionalGuest)

        // Check if required fields are filled
        if (!additionalGuest.name) {
          throw new Error(`Namn för ytterligare gäst ${i + 1} är obligatoriskt.`)
        }

        // Add additional guest to Firestore
        await addDoc(collection(db, 'replies'), additionalGuest)
      }

      setIsSubmitted(true)
    } catch (error) {
      console.error('Error submitting RSVP:', error)
      setError(error instanceof Error ? error.message : 'Det uppstod ett fel vid inlämning av RSVP. Försök igen senare.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderAdditionalGuestFields = (index: number) => (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="space-y-4 mt-4 p-4 border border-pastel-purple-200 rounded-md"
    >
      <h3 className="font-semibold">Ytterligare gäst {index + 1}</h3>
      <div className="space-y-2">
        <Label htmlFor={`guest-name-${index}`}>Namn</Label>
        <Input id={`guest-name-${index}`} name={`guest-name-${index}`} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`guest-email-${index}`}>E-post</Label>
        <Input id={`guest-email-${index}`} name={`guest-email-${index}`} type="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`guest-specialkost-${index}`}>Specialkost</Label>
        <Textarea id={`guest-specialkost-${index}`} name={`guest-specialkost-${index}`} placeholder="Ange eventuella matpreferenser eller allergier" />
      </div>
      <div className="space-y-2">
        <Label>Behöver boende?</Label>
        <RadioGroup defaultValue="nej" name={`guest-boende-${index}`} className="flex space-x-4">
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
        className="flex flex-col items-center justify-center min-h-screen bg-white rounded-lg"
        style={{ fontFamily: 'Centaur', color: 'black' }}
      >
        <Image
          src="/Inbjudan_bild.png"
          alt="Tack"
          width={300}
          height={600}
          className="mb-8"
        />
        <h2 className="text-3xl font-bold">Tack för din anmälan</h2>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4" style={{ fontFamily: 'Centaur', color: 'black' }}>
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
          className="text-3xl font-bold text-center mb-6"
        >
          Vi ska gifta oss!
        </motion.h1>
        <motion.form 
          onSubmit={handleSubmit} 
          className="space-y-6"
        >
          <Input name="name" placeholder="Namn" required />
          <Input name="email" type="email" placeholder="E-post" required />
          <div className="space-y-2">
            <Label>Behöver boende?</Label>
            <RadioGroup defaultValue="nej" name="boende" className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ja" id="boende-ja" />
                <Label htmlFor="boende-ja">Ja</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="nej" id="boende-nej" />
                <Label htmlFor="boende-nej">Nej</Label>
              </div>
            </RadioGroup>
          </div>
          <Textarea name="specialkost" placeholder="Ange eventuella matpreferenser eller allergier" />
          <div className="space-y-2">
            <Label htmlFor="additional-guests">Vill du anmäla någon till?</Label>
            <Select onValueChange={(value) => setAdditionalGuests(Number(value))}>
              <SelectTrigger id="additional-guests">
                <SelectValue placeholder="Välj antal" />
              </SelectTrigger>
              <SelectContent>
                {[0, 1, 2, 3, 4].map((option) => (
                  <SelectItem key={option} value={option.toString()}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {[...Array(additionalGuests)].map((_, index) => renderAdditionalGuestFields(index))}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-center"
            >
              {error}
            </motion.div>
          )}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <Button 
              type="submit" 
              className="w-full bg-pastel-purple-500 hover:bg-pastel-purple-600 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Skickar...' : 'Skicka RSVP'}
            </Button>
          </motion.div>
        </motion.form>
      </motion.div>
    </div>
  )
}