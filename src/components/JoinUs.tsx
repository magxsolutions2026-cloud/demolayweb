'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface FormData {
  fullName: string;
  age: string;
  contactNumber: string;
  email: string;
  address: string;
  schoolOccupation: string;
  reason: string;
}

const JoinUs: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    age: '',
    contactNumber: '',
    email: '',
    address: '',
    schoolOccupation: '',
    reason: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.age || parseInt(formData.age) < 12 || parseInt(formData.age) > 21) {
      newErrors.age = 'Age must be between 12 and 21';
    }
    if (!formData.contactNumber.trim()) newErrors.contactNumber = 'Contact number is required';
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Valid email is required';
    }
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.schoolOccupation.trim()) newErrors.schoolOccupation = 'School/Occupation is required';
    if (!formData.reason.trim()) newErrors.reason = 'Reason for joining is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    // Mock submission - replace with Firebase later
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setIsSubmitted(true);

    // Reset form
    setFormData({
      fullName: '',
      age: '',
      contactNumber: '',
      email: '',
      address: '',
      schoolOccupation: '',
      reason: '',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  if (isSubmitted) {
    return (
      <section id="join" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-8 rounded-lg"
          >
            <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-background" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gold mb-2">Application Submitted!</h3>
            <p className="text-foreground/80 mb-4">
              Thank you for your interest in joining T. De Leon Chapter No. 47.
              We will review your application and contact you soon.
            </p>
            <button
              onClick={() => setIsSubmitted(false)}
              className="px-6 py-2 bg-maroon text-white rounded-lg hover:bg-maroon/80 transition-colors"
            >
              Submit Another Application
            </button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="join" className="py-20 px-4 sm:px-6 lg:px-8 bg-maroon/5">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-foreground mb-4">Join Us</h2>
          <div className="w-24 h-1 bg-gold mx-auto"></div>
          <p className="text-foreground/80 mt-4">
            Ready to embark on a journey of brotherhood, leadership, and personal growth?
            Submit your petitioner application below.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          onSubmit={handleSubmit}
          className="glass p-8 rounded-lg space-y-6"
        >
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-background/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold ${
                  errors.fullName ? 'border-red-500' : 'border-gold/30'
                }`}
                placeholder="Enter your full name"
              />
              {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
            </div>

            <div>
              <label htmlFor="age" className="block text-sm font-medium text-foreground mb-2">
                Age *
              </label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                min="12"
                max="21"
                className={`w-full px-4 py-3 bg-background/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold ${
                  errors.age ? 'border-red-500' : 'border-gold/30'
                }`}
                placeholder="Enter your age"
              />
              {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="contactNumber" className="block text-sm font-medium text-foreground mb-2">
                Contact Number *
              </label>
              <input
                type="tel"
                id="contactNumber"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-background/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold ${
                  errors.contactNumber ? 'border-red-500' : 'border-gold/30'
                }`}
                placeholder="Enter your contact number"
              />
              {errors.contactNumber && <p className="text-red-500 text-sm mt-1">{errors.contactNumber}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-background/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold ${
                  errors.email ? 'border-red-500' : 'border-gold/30'
                }`}
                placeholder="Enter your email address"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-foreground mb-2">
              Address *
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-background/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold ${
                errors.address ? 'border-red-500' : 'border-gold/30'
              }`}
              placeholder="Enter your address"
            />
            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
          </div>

          <div>
            <label htmlFor="schoolOccupation" className="block text-sm font-medium text-foreground mb-2">
              School/Occupation *
            </label>
            <input
              type="text"
              id="schoolOccupation"
              name="schoolOccupation"
              value={formData.schoolOccupation}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-background/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold ${
                errors.schoolOccupation ? 'border-red-500' : 'border-gold/30'
              }`}
              placeholder="Enter your school or occupation"
            />
            {errors.schoolOccupation && <p className="text-red-500 text-sm mt-1">{errors.schoolOccupation}</p>}
          </div>

          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-foreground mb-2">
              Why do you want to join DeMolay? *
            </label>
            <textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows={4}
              className={`w-full px-4 py-3 bg-background/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold ${
                errors.reason ? 'border-red-500' : 'border-gold/30'
              }`}
              placeholder="Tell us about your interest in joining DeMolay"
            />
            {errors.reason && <p className="text-red-500 text-sm mt-1">{errors.reason}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-maroon text-white rounded-lg hover:bg-maroon/80 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              'Submit Application'
            )}
          </button>
        </motion.form>
      </div>
    </section>
  );
};

export default JoinUs;