"use client";

import React, { useState } from "react";
import { ProductItem } from "@/utils/affiliateUtils";

export interface EmailCaptureFormProps {
  selectedItems: ProductItem[];
  onSubmit?: (formData: FormData) => void;
  onCancel: () => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
}

const EmailCaptureForm: React.FC<EmailCaptureFormProps> = ({ 
  selectedItems,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: ""
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ 
    success?: boolean; 
    message?: string;
    previewUrl?: string;
  } | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user types
    if (errors[name as keyof FormData]) {
      setErrors({
        ...errors,
        [name]: undefined
      });
    }
  };
  
  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      // Call our email API endpoint
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          items: selectedItems,
          projectTitle: 'Your DIY Project' // Could be dynamic in the future
        }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setSubmitStatus({ 
          success: true, 
          message: result.message || 'Shopping list sent successfully!',
          previewUrl: result.previewUrl
        });
        
        // If onSubmit callback is provided, call it
        if (onSubmit) {
          onSubmit(formData);
        }
      } else {
        setSubmitStatus({ 
          success: false, 
          message: result.message || 'Failed to send shopping list. Please try again.' 
        });
      }
    } catch (error) {
      console.error('Error sending shopping list:', error);
      setSubmitStatus({ 
        success: false, 
        message: 'An unexpected error occurred. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-secondary">Save Your Shopping List</h2>
        <p className="text-gray-600 mt-2">
          Enter your details to save your shopping list with {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''}.
        </p>
      </div>
      
      {submitStatus && (
        <div className={`p-4 mb-6 rounded-md ${
          submitStatus.success 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <p className="flex items-center">
            {submitStatus.success ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            {submitStatus.message}
          </p>
          
          {submitStatus.success && (
            <p className="mt-2 text-sm">
              Check your inbox for your shopping list!
            </p>
          )}
          
          {submitStatus.success && submitStatus.previewUrl && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-blue-800 font-medium mb-1">Email Preview Available</p>
              <p className="text-sm text-blue-700 mb-2">
                Click the link below to see a preview of the email that was sent:
              </p>
              <a 
                href={submitStatus.previewUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 underline flex items-center font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                View Email Preview
              </a>
            </div>
          )}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name*
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={`input ${errors.firstName ? 'border-red-500 ring-red-500' : ''}`}
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="input"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address*
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`input ${errors.email ? 'border-red-500 ring-red-500' : ''}`}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
          )}
        </div>
        
        <div className="pt-4 flex flex-col sm:flex-row gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary flex-1"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              "Create My Shopping List"
            )}
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            className="btn bg-gray-200 hover:bg-gray-300 text-gray-800"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EmailCaptureForm; 