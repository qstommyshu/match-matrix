
import React, { useState, useEffect, useRef } from 'react';

const Stats = () => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef(null);

  const stats = [
    { value: 10000, label: "Job Matches", suffix: "+", color: "text-neon-purple" },
    { value: 2500, label: "Companies", suffix: "+", color: "text-neon-blue" },
    { value: 50000, label: "Candidates", suffix: "+", color: "text-neon-green" },
    { value: 95, label: "Satisfaction Rate", suffix: "%", color: "text-neon-pink" },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  const CounterAnimation = ({ value, duration = 2000, isInView, suffix = "" }) => {
    const [count, setCount] = useState(0);
    const stepRef = useRef(null);

    useEffect(() => {
      if (!isInView) return;

      let startTime;
      const step = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        setCount(Math.floor(progress * value));

        if (progress < 1) {
          stepRef.current = requestAnimationFrame(step);
        }
      };

      stepRef.current = requestAnimationFrame(step);

      return () => {
        if (stepRef.current) {
          cancelAnimationFrame(stepRef.current);
        }
      };
    }, [isInView, value, duration]);

    return (
      <span>
        {count}
        {suffix}
      </span>
    );
  };

  return (
    <div ref={ref} className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Match Matrix by Numbers</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our platform continues to grow, connecting talented professionals with amazing opportunities.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="glass-card p-6 text-center"
            >
              <div className={`${stat.color} text-4xl md:text-5xl font-bold mb-2`}>
                {isInView ? (
                  <CounterAnimation 
                    value={stat.value} 
                    isInView={isInView} 
                    suffix={stat.suffix}
                  />
                ) : (
                  <>0{stat.suffix}</>
                )}
              </div>
              <p className="text-gray-600 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Stats;
