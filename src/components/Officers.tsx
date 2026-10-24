'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface Officer {
  name: string;
  position: string;
  image: string;
}

const officers: Officer[] = [
  {
    name: 'John Smith',
    position: 'Master Councilor',
    image: '/placeholder-officer.svg',
  },
  {
    name: 'Mike Johnson',
    position: 'Senior Councilor',
    image: '/placeholder-officer.svg',
  },
  {
    name: 'David Brown',
    position: 'Junior Councilor',
    image: '/placeholder-officer.svg',
  },
  {
    name: 'Alex Wilson',
    position: 'Treasurer',
    image: '/placeholder-officer.svg',
  },
  {
    name: 'Chris Davis',
    position: 'Secretary',
    image: '/placeholder-officer.svg',
  },
  {
    name: 'Ryan Miller',
    position: 'Chaplain',
    image: '/placeholder-officer.svg',
  },
];

const OfficerCard: React.FC<{ officer: Officer; index: number }> = ({ officer, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className="glass p-6 rounded-lg text-center group"
    >
      <div className="relative w-24 h-24 mx-auto mb-4 overflow-hidden rounded-full bg-maroon/20">
        <Image
          src={officer.image}
          alt={officer.name}
          fill
          sizes="(max-width: 768px) 80px, 96px"
          className="object-cover group-hover:scale-110 transition-transform duration-300"
        />
      </div>
      <h3 className="text-xl font-semibold text-gold mb-1">{officer.name}</h3>
      <p className="text-maroon font-medium">{officer.position}</p>
    </motion.div>
  );
};

const Officers: React.FC = () => {
  return (
    <section id="officers" className="py-20 px-4 sm:px-6 lg:px-8 bg-maroon/5">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-foreground mb-4">Chapter Officers</h2>
          <div className="w-24 h-1 bg-gold mx-auto"></div>
          <p className="text-foreground/80 mt-4 max-w-2xl mx-auto">
            Meet the dedicated leaders who guide our chapter and inspire our members
            to achieve excellence in brotherhood and leadership.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {officers.map((officer, index) => (
            <OfficerCard key={officer.name} officer={officer} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Officers;
