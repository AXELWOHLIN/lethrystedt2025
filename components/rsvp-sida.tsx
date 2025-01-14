'use client'

import { useState, useEffect } from 'react'
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
  const [isAttending, setIsAttending] = useState(false) // Default to false for "Nej"

  // State for managing the main guest's email
  const [mainEmail, setMainEmail] = useState<string>('')

  // State for managing additional guests' emails
  const [guestEmails, setGuestEmails] = useState<string[]>([])

  // State to track which guests are using the primary email
  const [usingPrimaryEmail, setUsingPrimaryEmail] = useState<boolean[]>([])

  // Initialize guestEmails and usingPrimaryEmail arrays based on additionalGuests
  useEffect(() => {
    setGuestEmails((prevEmails) => {
      const newEmails = [...prevEmails]
      while (newEmails.length < additionalGuests) {
        newEmails.push('')
      }
      while (newEmails.length > additionalGuests) {
        newEmails.pop()
      }
      return newEmails
    })
    setUsingPrimaryEmail((prev) => {
      const newUsing = [...prev]
      while (newUsing.length < additionalGuests) {
        newUsing.push(false)
      }
      while (newUsing.length > additionalGuests) {
        newUsing.pop()
      }
      return newUsing
    })
  }, [additionalGuests])

  // Update guestEmails when mainEmail changes for guests using primary email
  useEffect(() => {
    setGuestEmails((prevEmails) => {
      const updatedEmails = [...prevEmails]
      usingPrimaryEmail.forEach((usePrimary, index) => {
        if (usePrimary) {
          updatedEmails[index] = mainEmail
        }
      })
      return updatedEmails
    })
  }, [mainEmail, usingPrimaryEmail])

  const handleGuestEmailChange = (index: number, email: string) => {
    const updatedEmails = [...guestEmails]
    updatedEmails[index] = email
    setGuestEmails(updatedEmails)
  }

  const handleUsePrimaryEmail = (index: number, usePrimary: boolean) => {
    const updatedUsingPrimary = [...usingPrimaryEmail]
    updatedUsingPrimary[index] = usePrimary
    setUsingPrimaryEmail(updatedUsingPrimary)

    const updatedEmails = [...guestEmails]
    if (usePrimary) {
      updatedEmails[index] = mainEmail
    } else {
      updatedEmails[index] = ''
    }
    setGuestEmails(updatedEmails)
  }

  const handleAttendanceChange = (value: string) => {
    setIsAttending(value === 'ja')
  }

  const handleMainEmailChange = (email: string) => {
    setMainEmail(email)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const form = event.currentTarget
    const formData = new FormData(form)

    try {
      // Main respondent data
      const kommer = formData.get('kommer-du') as string

      // Validate kommer field
      if (!kommer) {
        throw new Error('Du måste välja om du kommer eller inte.')
      }

      const primaryEmail = mainEmail.trim()

      const mainRespondent = {
        name: (formData.get('name') as string)?.trim() || '',
        email: primaryEmail,
        kommer: kommer, // Ensure kommer is included
        boende: (formData.get('boende') as string)?.trim() || '',
        specialkost: (formData.get('specialkost') as string)?.trim() || '',
        ovrigt: (formData.get('ovrigt') as string)?.trim() || '',
        isMainRespondent: true,
        timestamp: new Date(),
      }

      // Check if required fields are filled
      if (!mainRespondent.name || !mainRespondent.email) {
        throw new Error('Namn och e-post är obligatoriska fält.')
      }

      // Add main respondent to Firestore
      await addDoc(collection(db, 'replies'), mainRespondent)

      // Handle additional guests
      for (let i = 0; i < additionalGuests; i++) {
        const kommerGäst = formData.get(`kommer-du-${i}`) as string || '' // Adjusted field name for uniqueness

        // Updated logic: Use mainEmail if usingPrimaryEmail[i] is true
        const guestEmail = usingPrimaryEmail[i] ? mainEmail.trim() : (formData.get(`guest-email-${i}`) as string)?.trim() || ''

        const additionalGuest = {
          name: (formData.get(`guest-name-${i}`) as string)?.trim() || '',
          email: guestEmail, // Use the determined email
          kommer: kommer,
          specialkost: (formData.get(`guest-specialkost-${i}`) as string)?.trim() || '',
          boende: (formData.get(`guest-boende-${i}`) as string)?.trim() || '',
          isMainRespondent: false,
          timestamp: new Date(),
        }

        // Log the additional guest data for debugging
        console.log(`Additional Guest ${i + 1} Data:`, additionalGuest)

        // Check if required fields are filled
        if (!additionalGuest.name) {
          throw new Error(`Namn för ytterligare gäst ${i + 1} är obligatoriskt.`)
        }

        if (!additionalGuest.email) {
          throw new Error(`E-post för ytterligare gäst ${i + 1} är obligatoriskt.`)
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
        <Input 
          id={`guest-name-${index}`} 
          name={`guest-name-${index}`} 
          required 
          placeholder="Namn"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`guest-email-${index}`}>E-post</Label>
        <Input
          id={`guest-email-${index}`}
          name={`guest-email-${index}`}
          placeholder="Ange e-post eller använd samma som huvudgästen"
          value={guestEmails[index] || ''}
          onChange={(e) => handleGuestEmailChange(index, e.target.value)}
          disabled={usingPrimaryEmail[index]}
        />
        <div className="flex items-center space-x-2 mt-2">
          <input
            type="checkbox"
            id={`use-primary-email-${index}`}
            checked={usingPrimaryEmail[index]}
            onChange={(e) => handleUsePrimaryEmail(index, e.target.checked)}
          />
          <Label htmlFor={`use-primary-email-${index}`}>Använd samma e-post som huvudgästen</Label>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`guest-specialkost-${index}`}>Specialkost</Label>
        <Textarea
          id={`guest-specialkost-${index}`}
          name={`guest-specialkost-${index}`}
          placeholder="Ange eventuella matpreferenser eller allergier"
        />
      </div>
      <div className="space-y-2">
        <Label>Behövs boende?</Label>
        <RadioGroup name={`guest-boende-${index}`} className="flex space-x-4">
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
          Välkommen på bröllop!
          <p className="text-base font-normal text-center">EMIL & MATHILDA</p>
          <p className="text-sm font-normal text-center">~ HELGEN 7-8 JUNI, 2025 ~</p>
          <p className="text-sm font-normal text-center -mb-1.5">Vi ser fram emot att få fira de här dagarna med er!</p>
          <p className="text-sm font-normal text-center -mb-3">Vänligen OSA nedan för varje person som kommer</p>
        </motion.h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name"><strong>Namn</strong></Label>
            <Input 
              name="name" 
              placeholder="Namn" 
              required 
              className="mt-4 mb-4" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email"><strong>E-post</strong></Label>
            <Input 
              name="email" 
              type="email" 
              placeholder="E-post" 
              required 
              className="mb-4" 
              value={mainEmail}
              onChange={(e) => handleMainEmailChange(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label><strong>Kommer du?</strong></Label>
            <RadioGroup 
              name="kommer-du" 
              className="flex space-x-4" 
              onValueChange={handleAttendanceChange}
              required
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ja" id="kommer-du-ja" />
                <Label htmlFor="kommer-du-ja">Ja, såklart!</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="nej" id="kommer-du-nej" />
                <Label htmlFor="kommer-du-nej">Nej, tyvärr...</Label>
              </div>
            </RadioGroup>
          </div>
          {isAttending && (
            <>
              <div className="space-y-2 mt-4">
                <Label><strong>Behöver du boende?</strong></Label>
                <p className="custom-small-text">
                  Boende omkring Marby är begränsat. Vi har ordnat med enklare boende på eller i
                  närheten av Marby för alla gäster som önskar till ett självkostnadspris. Mer info
                  kommer efter OSA
                </p>
                <RadioGroup name="boende" className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ja" id="boende-ja" />
                    <Label htmlFor="boende-ja">Ja, gärna!</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="nej" id="boende-nej" />
                    <Label htmlFor="boende-nej">Nej, jag behöver inte/jag fixar eget.</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialkost"><strong>Har du några allergier eller matpreferenser?</strong></Label>
                <Textarea 
                  name="specialkost" 
                  placeholder="Ange eventuella matpreferenser eller allergier" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="additional-guests"><strong>Vill du anmäla ytterligare gäster?</strong></Label>
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
            </>
          )}
          <div className="space-y-2">
            <Label htmlFor="ovrigt"><strong>Övriga kommentarer eller önskemål</strong></Label>
            <Textarea 
              name="ovrigt" 
              placeholder="Ange övriga kommentarer eller önskemål" 
            />
          </div>
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
              className="w-full bg-[#9da08b] hover:bg-[#8a8d7a] text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Skickar...' : 'SKICKA SVAR'}
            </Button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  )
}