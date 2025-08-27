'use client';
import React from 'react';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { motion } from 'motion/react';
import ImageUpload from './ImageUpload';
import Image from 'next/image';

export default function Home() {
  return (
    <AuroraBackground>
      <div className="relative z-10 flex flex-col items-center justify-start pt-20 md:pt-32 w-full h-full space-y-8">
        <motion.div
          initial={{ opacity: 0.0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: 'easeInOut'
          }}
          className="relative flex flex-col gap-4 items-center justify-center px-4"
        >
          <div className="text-3xl flex items-center space-x-2">
            <Image src="/logo_icon.png" alt="Uplane Logo" className="w-12 h-12" />
            <h1 className="text-4xl font-bold text-gray-900">uplane</h1>
          </div>
          <div className="font-extralight text-base md:text-3xl dark:text-neutral-200">
            Upload your image and get a transparent background
          </div>
        </motion.div>
        <ImageUpload />
      </div>
    </AuroraBackground>
  );
}
