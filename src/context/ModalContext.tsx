/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, type ReactNode } from 'react';
import AddChildModal from '../components/Modals/AddChildModal/AddChildModal';
import AssignParentModal from '../components/Modals/AssignParentModal/AssignParentModal';

interface ModalContextType {
  openAddChildModal: () => void;
  closeAddChildModal: () => void;
  // 1. التعديل هنا: الدالة تستقبل رقم
  openAssignParentModal: (childId: number) => void; 
  closeAssignParentModal: () => void; 
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [isAddChildModalOpen, setIsAddChildModalOpen] = useState(false);
  const [isAssignParentOpen, setIsAssignParentOpen] = useState(false);
  // 2. التعديل هنا: ستيت تحفظ الرقم
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);

  return (
    <ModalContext.Provider 
      value={{
        openAddChildModal: () => setIsAddChildModalOpen(true),
        closeAddChildModal: () => setIsAddChildModalOpen(false),
        // 3. التعديل هنا: الدالة تحفظ الرقم وتفتح المودال
        openAssignParentModal: (childId: number) => { 
          setSelectedChildId(childId);
          setIsAssignParentOpen(true);
        },
        closeAssignParentModal: () => {
          setIsAssignParentOpen(false);
          setSelectedChildId(null);
        }
      }}
    >
      {children}
      
      {isAddChildModalOpen && (
        <AddChildModal onClose={() => setIsAddChildModalOpen(false)} />
      )}
      
      {/* 4. التعديل هنا: بنمرر الـ ID للمودال كـ Prop */}
      {isAssignParentOpen && selectedChildId !== null && (
        <AssignParentModal childId={selectedChildId} onClose={() => {
          setIsAssignParentOpen(false);
          setSelectedChildId(null);
        }} />
      )}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};