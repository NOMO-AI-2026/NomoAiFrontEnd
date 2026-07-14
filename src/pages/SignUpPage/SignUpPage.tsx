import React from 'react';
import { Mail, Lock, Eye, ArrowRight, User } from 'lucide-react';
import styles from './SignUpPage.module.css';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#F8F7FF] flex items-center justify-center p-6 font-sans text-[#1E1B4B]">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
        {/* Left Section */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
          <div className="space-y-3">
            <h1 className="text-5xl lg:text-6xl font-extrabold text-[#6B21A8] tracking-tight">
              NomoAI
            </h1>
            <p className="text-xl lg:text-2xl font-bold text-[#1E1B4B] max-w-sm">
              Speech therapy that feels like play.
            </p>
          </div>
          
          <div className={`mt-8 ${styles.imageFrame} bg-white p-2 w-72 h-72 lg:w-80 lg:h-80 flex items-center justify-center`}>
             <img 
               src="https://placehold.co/400x400/f8f9fa/6b21a8?text=Monster+Img" 
               alt="NomoAI Mascot" 
               className="w-full h-full object-cover rounded-[1.8rem]"
             />
          </div>
        </div>

        {/* Right Section - Sign Up Card */}
        <div className={`bg-white p-8 lg:p-10 ${styles.cardShadow}`}>
          <h2 className="text-3xl font-extrabold text-[#6B21A8] mb-2">Create an Account</h2>
          <p className="text-sm font-bold text-gray-600 mb-8">Join us and start your progress today.</p>

          <form className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold text-[#6B21A8] tracking-widest uppercase">Full Name</label>
              <div className={`flex items-center bg-[#F8F7FF] px-4 py-3.5 ${styles.inputContainer}`}>
                <User className="w-5 h-5 text-[#6B21A8] mr-3" />
                <input 
                  type="text" 
                  placeholder="John Doe" 
                  className="bg-transparent border-none outline-none flex-1 text-sm font-bold text-[#1E1B4B] placeholder-gray-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-extrabold text-[#6B21A8] tracking-widest uppercase">Email Address</label>
              <div className={`flex items-center bg-[#F8F7FF] px-4 py-3.5 ${styles.inputContainer}`}>
                <Mail className="w-5 h-5 text-[#6B21A8] mr-3" />
                <input 
                  type="email" 
                  placeholder="hello@friend.com" 
                  className="bg-transparent border-none outline-none flex-1 text-sm font-bold text-[#1E1B4B] placeholder-gray-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-extrabold text-[#6B21A8] tracking-widest uppercase">Password</label>
              <div className={`flex items-center bg-[#F8F7FF] px-4 py-3.5 ${styles.inputContainer}`}>
                <Lock className="w-5 h-5 text-[#6B21A8] mr-3" />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="bg-transparent border-none outline-none flex-1 text-sm font-bold text-[#1E1B4B] placeholder-gray-300 tracking-widest"
                />
                <Eye className="w-5 h-5 text-[#6B21A8] cursor-pointer" />
              </div>
            </div>

            <button 
              type="button" 
              className={`w-full bg-[#FACC15] hover:bg-[#f4c40b] text-[#1E1B4B] font-extrabold text-[15px] py-3.5 rounded-full flex justify-center items-center gap-2 mt-4 ${styles.buttonShadow}`}
            >
              Sign Up
              <ArrowRight className="w-5 h-5" strokeWidth={3} />
            </button>
          </form>

          <div className="mt-8 flex items-center justify-center space-x-4">
            <div className="h-px bg-gray-200 flex-1"></div>
            <span className="text-[10px] font-extrabold text-gray-400 tracking-widest uppercase">Or Continue With</span>
            <div className="h-px bg-gray-200 flex-1"></div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 border-2 border-gray-200 rounded-full py-3 text-sm font-bold text-[#1E1B4B] hover:bg-gray-50 transition-colors">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" alt="Google" />
              Google
            </button>
            <button className="flex items-center justify-center gap-2 border-2 border-gray-200 rounded-full py-3 text-sm font-bold text-[#1E1B4B] hover:bg-gray-50 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" className="w-4 h-4" fill="currentColor"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
              Apple
            </button>
          </div>

          <div className="mt-8 text-center text-xs font-bold text-gray-500">
            Already have an account? <a href="/login" className="text-[#6B21A8] hover:underline ml-1">Log in here</a>
          </div>
        </div>
      </div>

      {/* Floating Help Button */}
      <div className="fixed bottom-6 right-6">
        <button className="bg-[#6B21A8] text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:bg-purple-800 transition-colors">
          <span className="text-xl font-bold">?</span>
        </button>
      </div>
    </div>
  );
}
