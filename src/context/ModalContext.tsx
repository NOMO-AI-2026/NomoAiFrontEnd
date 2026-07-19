/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, type ReactNode } from 'react';
import AddChildModal from '../components/Modals/AddChildModal/AddChildModal';
import AssignParentModal from '../components/Modals/AssignParentModal/AssignParentModal';

interface ModalContextType {
  openAddChildModal: (childData?: any) => void; // 👈 التعديل: تقبل بيانات
  closeAddChildModal: () => void;
  openAssignParentModal: (childId: number) => void; 
  closeAssignParentModal: () => void; 
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [isAddChildModalOpen, setIsAddChildModalOpen] = useState(false);
  const [editChildData, setEditChildData] = useState<any>(null); // 👈 ستيت جديدة لحفظ بيانات التعديل
  
  const [isAssignParentOpen, setIsAssignParentOpen] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);

  return (
    <ModalContext.Provider 
      value={{
        // 👈 التعديل: الدالة بتاخد البيانات، تحفظها، وتفتح المودال
        openAddChildModal: (childData?: any) => {
          setEditChildData(childData || null);
          setIsAddChildModalOpen(true);
        },
        closeAddChildModal: () => {
          setIsAddChildModalOpen(false);
          setEditChildData(null); // تفريغ البيانات عند الإغلاق
        },
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
      
      {/* 👈 التعديل: تمرير البيانات للمودال */}
      {isAddChildModalOpen && (
        <AddChildModal 
          editData={editChildData} 
          onClose={() => {
            setIsAddChildModalOpen(false);
            setEditChildData(null);
          }} 
        />
      )}
      
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