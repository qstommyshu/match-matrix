
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

const testimonials = [
  {
    quote: "Match Matrix helped me find a job that aligns perfectly with my skills and career goals. The matching algorithm is incredibly accurate!",
    author: "Alex Johnson",
    role: "Software Developer",
    company: "TechCorp",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    quote: "As a hiring manager, Match Matrix has completely transformed our recruitment process. We've reduced time-to-hire by 40% and found better fits for our culture.",
    author: "Sarah Williams",
    role: "HR Director",
    company: "InnovateTech",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    quote: "The skill assessment feature really helped me identify areas to improve. After focusing on those skills, I landed my dream job within weeks!",
    author: "Michael Chen",
    role: "UX Designer",
    company: "DesignHub",
    avatar: "https://randomuser.me/api/portraits/men/67.jpg",
  },
  {
    quote: "Our startup has been able to compete with larger companies for talent thanks to Match Matrix. The platform's matching precision is unparalleled.",
    author: "Emma Rodriguez",
    role: "Founder & CEO",
    company: "GrowthBase",
    avatar: "https://randomuser.me/api/portraits/women/23.jpg",
  },
];

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextTestimonial = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Success Stories</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Hear from candidates and companies who found their perfect match on our platform.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="glass relative p-8 md:p-12 rounded-2xl overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-16 h-16 rounded-br-3xl bg-gradient-to-r from-neon-purple to-neon-blue opacity-20"></div>
            <div className="absolute bottom-0 right-0 w-16 h-16 rounded-tl-3xl bg-gradient-to-r from-neon-blue to-neon-purple opacity-20"></div>
            
            <div className="relative z-10">
              <div className="mb-8">
                <svg className="w-12 h-12 text-neon-purple opacity-30" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>
              
              <div className="relative h-[280px]">
                {testimonials.map((testimonial, index) => (
                  <div 
                    key={index}
                    className={`absolute top-0 left-0 w-full transition-all duration-500 ease-in-out ${
                      index === activeIndex 
                        ? 'opacity-100 translate-x-0' 
                        : 'opacity-0 translate-x-32 pointer-events-none'
                    }`}
                  >
                    <p className="text-xl md:text-2xl text-gray-800 mb-8 font-light leading-relaxed">
                      "{testimonial.quote}"
                    </p>
                    
                    <div className="flex items-center">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.author}
                        className="w-12 h-12 rounded-full mr-4 border-2 border-white shadow-md"
                      />
                      <div>
                        <h4 className="font-semibold text-lg">{testimonial.author}</h4>
                        <p className="text-gray-600 text-sm">
                          {testimonial.role} at {testimonial.company}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between mt-8">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={prevTestimonial}
                  className="rounded-full border-gray-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="sr-only">Previous</span>
                </Button>
                
                <div className="flex space-x-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      className={`w-2.5 h-2.5 rounded-full ${
                        index === activeIndex ? 'bg-neon-purple' : 'bg-gray-300'
                      }`}
                      onClick={() => setActiveIndex(index)}
                    >
                      <span className="sr-only">Testimonial {index + 1}</span>
                    </button>
                  ))}
                </div>
                
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={nextTestimonial}
                  className="rounded-full border-gray-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="sr-only">Next</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
