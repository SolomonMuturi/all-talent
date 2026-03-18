// app/join/page.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, Mail, Phone, MapPin, User, Sparkles, Shield, Clock, Target, Users } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';

export default function JoinPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    userType: 'player',
    message: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    // Send request to your backend API
    const response = await fetch('/api/send-trial-request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      // Show success message
      setIsSubmitted(true);
      
      // Reset form after success
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          phone: '',
          location: '',
          userType: 'player',
          message: '',
        });
      }, 3000);
    } else {
      throw new Error(result.message || 'Failed to send request');
    }

  } catch (error) {
    console.error('Error:', error);
    alert('There was an error sending your request. Please try again or email us directly at solomonnjuguna8@gmail.com');
  } finally {
    setIsSubmitting(false);
  }
};

  const trialBenefits = [
    {
      icon: <Target className="h-5 w-5 text-green-500" />,
      title: "AI-Powered Scouting",
      description: "Get discovered by top scouts using our advanced matching algorithms"
    },
    {
      icon: <Users className="h-5 w-5 text-blue-500" />,
      title: "Global Network",
      description: "Connect with 5,000+ clubs and academies worldwide"
    },
    {
      icon: <Shield className="h-5 w-5 text-purple-500" />,
      title: "Verified Profiles",
      description: "All scouts and clubs are verified for authenticity"
    },
    {
      icon: <Clock className="h-5 w-5 text-yellow-500" />,
      title: "14-Day Full Access",
      description: "Experience all premium features for 14 days"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white">
      {/* Header */}
      <div className="container mx-auto px-4 md:px-8 py-6">
        <Link href="/" className="inline-flex items-center text-green-500 hover:text-green-400 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 mb-6 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full border border-green-500/30">
              <Sparkles className="h-6 w-6 text-yellow-500 animate-pulse" />
              <span className="text-xl font-semibold text-green-400 uppercase tracking-wider">
                Start Your Football Journey
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold font-headline tracking-tighter mb-6">
              Request Your <span className="bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">Free Trial</span>
            </h1>
            
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Join 50,000+ football players, coaches, and scouts. Experience the future of football talent management with our 14-day free trial.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column - Form */}
            <div className="lg:col-span-2">
              <Card className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 shadow-2xl rounded-3xl overflow-hidden">
                <CardContent className="p-8 md:p-12">
                  {isSubmitted ? (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-6">
                        <CheckCircle className="h-12 w-12 text-green-500" />
                      </div>
                      <h2 className="text-3xl font-bold mb-4 text-green-500">Request Sent Successfully!</h2>
                      <p className="text-gray-300 mb-8">
                        Thank you for your interest in TalantaTrack! We've prepared an email for you to send to our team. 
                        Please check your email client and send the message to get started with your free trial.
                      </p>
                      <p className="text-sm text-gray-400 mb-8">
                        If the email doesn't open automatically, please email us at:{' '}
                        <a href="mailto:solomonnjuguna8@gmail.com" className="text-green-500 hover:underline">
                          solomonnjuguna8@gmail.com
                        </a>
                      </p>
                      <div className="space-y-4">
                        <Button asChild className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-6 text-lg">
                          <Link href="/">
                            Return to Homepage
                          </Link>
                        </Button>
                        <Button variant="outline" className="w-full border-gray-600 text-white hover:bg-gray-800 py-6 text-lg" onClick={() => setIsSubmitted(false)}>
                          Submit Another Request
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-3xl font-bold mb-2">Contact Us for Free Trial</h2>
                      <p className="text-gray-400 mb-8">
                        Fill out the form below and we'll send you an email to start your 14-day free trial
                      </p>
                      
                      <form onSubmit={handleSubmit} className="space-y-6">
                        {/* User Type Selection */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          {[
                            { value: 'player', label: 'Football Player', desc: 'Looking to get discovered' },
                            { value: 'coach', label: 'Coach/Scout', desc: 'Looking for talent' },
                            { value: 'academy', label: 'Academy/Club', desc: 'Team management' }
                          ].map((type) => (
                            <div
                              key={type.value}
                              className={`relative cursor-pointer p-4 rounded-2xl border-2 transition-all ${
                                formData.userType === type.value
                                  ? 'border-green-500 bg-green-500/10'
                                  : 'border-gray-700 hover:border-gray-600'
                              }`}
                              onClick={() => setFormData(prev => ({ ...prev, userType: type.value }))}
                            >
                              <div className="font-bold mb-1">{type.label}</div>
                              <div className="text-sm text-gray-400">{type.desc}</div>
                              {formData.userType === type.value && (
                                <div className="absolute top-2 right-2">
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Form Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="flex items-center text-sm font-medium text-gray-300">
                              <User className="h-4 w-4 mr-2" />
                              Full Name *
                            </label>
                            <Input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              placeholder="Enter your full name"
                              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 rounded-xl h-12"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="flex items-center text-sm font-medium text-gray-300">
                              <Mail className="h-4 w-4 mr-2" />
                              Email Address *
                            </label>
                            <Input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              placeholder="you@example.com"
                              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 rounded-xl h-12"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="flex items-center text-sm font-medium text-gray-300">
                              <Phone className="h-4 w-4 mr-2" />
                              Phone Number
                            </label>
                            <Input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              placeholder="+1 (555) 123-4567"
                              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 rounded-xl h-12"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="flex items-center text-sm font-medium text-gray-300">
                              <MapPin className="h-4 w-4 mr-2" />
                              Location *
                            </label>
                            <Input
                              type="text"
                              name="location"
                              value={formData.location}
                              onChange={handleChange}
                              placeholder="City, Country"
                              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 rounded-xl h-12"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-300">
                            Additional Message (Optional)
                          </label>
                          <Textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Tell us about your football background, goals, or any specific needs..."
                            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 rounded-xl min-h-[120px]"
                            rows={4}
                          />
                        </div>

                        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <Shield className="h-5 w-5 text-green-500 mt-0.5" />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm text-gray-300">
                                By submitting this form, you agree to receive your free trial details via email. 
                                We respect your privacy and will not share your information with third parties.
                              </p>
                            </div>
                          </div>
                        </div>

                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-6 text-lg rounded-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <Mail className="h-5 w-5 mr-2" />
                              Send Free Trial Request
                            </>
                          )}
                        </Button>

                        <p className="text-center text-sm text-gray-400">
                          Your email client will open with a pre-filled message. 
                          Just click 'Send' to request your free trial.
                        </p>
                      </form>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Benefits */}
            <div className="space-y-8">
              <Card className="bg-gradient-to-br from-green-900/20 to-blue-900/20 backdrop-blur-sm border border-green-500/30 rounded-3xl overflow-hidden">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-6 text-green-500">What&apos;s Included in Your Free Trial</h3>
                  <ul className="space-y-6">
                    {trialBenefits.map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          {benefit.icon}
                        </div>
                        <div className="ml-4">
                          <h4 className="font-bold text-white">{benefit.title}</h4>
                          <p className="text-sm text-gray-300 mt-1">{benefit.description}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-3xl overflow-hidden">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-6 text-white">How It Works</h3>
                  <ol className="space-y-6">
                    {[
                      { step: '1', title: 'Submit Request', desc: 'Fill out the form with your details' },
                      { step: '2', title: 'Email Confirmation', desc: 'Send the pre-filled email to our team' },
                      { step: '3', title: 'Trial Activation', desc: 'We\'ll activate your 14-day free trial within 24 hours' },
                      { step: '4', title: 'Onboarding Call', desc: 'Optional 30-minute setup call with our team' }
                    ].map((step) => (
                      <li key={step.step} className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center font-bold mr-4">
                          {step.step}
                        </div>
                        <div>
                          <h4 className="font-bold text-white">{step.title}</h4>
                          <p className="text-sm text-gray-300 mt-1">{step.desc}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-sm border border-blue-500/30 rounded-3xl overflow-hidden">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4 text-white">Need Help?</h3>
                  <p className="text-gray-300 mb-4">
                    Have questions about the free trial? Contact us directly:
                  </p>
                  <div className="space-y-3">
                    <a 
                      href="mailto:solomonnjuguna8@gmail.com" 
                      className="flex items-center text-green-500 hover:text-green-400 transition-colors"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      solomonnjuguna8@gmail.com
                    </a>
                    <p className="text-sm text-gray-400">
                      We typically respond within 24 hours during business days.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '50,000+', label: 'Football Players' },
              { value: '5,000+', label: 'Clubs & Academies' },
              { value: '120+', label: 'Countries' },
              { value: '98%', label: 'Success Rate' }
            ].map((stat, index) => (
              <div key={index} className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
                <div className="text-3xl font-bold text-green-500 mb-2">{stat.value}</div>
                <div className="text-gray-300 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="mt-20 max-w-3xl mx-auto">
            <h3 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h3>
            <div className="space-y-4">
              {[
                {
                  q: 'How long does it take to activate my free trial?',
                  a: 'We typically activate free trials within 24 hours of receiving your email request. You\'ll receive confirmation and login details via email.'
                },
                {
                  q: 'What happens after the 14-day trial?',
                  a: 'After your trial ends, you can choose to upgrade to a paid plan or continue with our limited free forever plan. All your data will be preserved.'
                },
                {
                  q: 'Is my credit card required for the free trial?',
                  a: 'No, we don\'t require any payment information for the free trial. You only provide payment details if you choose to upgrade after the trial.'
                },
                {
                  q: 'Can I extend my free trial?',
                  a: 'We occasionally offer trial extensions for active users. Contact our support team if you need more time to evaluate the platform.'
                }
              ].map((faq, index) => (
                <div key={index} className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
                  <h4 className="font-bold text-white mb-2">{faq.q}</h4>
                  <p className="text-gray-300">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}