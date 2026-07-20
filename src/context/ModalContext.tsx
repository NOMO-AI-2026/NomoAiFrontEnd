/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, type ReactNode } from 'react';
import AddChildModal from '../components/Modals/AddChildModal/AddChildModal';
import AssignParentModal from '../components/Modals/AssignParentModal/AssignParentModal';
import { type ChildProfileData } from '../types/child.types';

interface ModalContextType {
  openAddChildModal: (childData?: ChildProfileData | null) => void; // 👈 التعديل: تقبل بيانات
  closeAddChildModal: () => void;
  openAssignParentModal: (childId: number) => void; 
  closeAssignParentModal: () => void; 
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [isAddChildModalOpen, setIsAddChildModalOpen] = useState(false);
  const [editChildData, setEditChildData] = useState<ChildProfileData | null>(null); // 👈 ستيت جديدة لحفظ بيانات التعديل
  
  const [isAssignParentOpen, setIsAssignParentOpen] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);

  return (
    <ModalContext.Provider 
      value={{
        // 👈 التعديل: الدالة بتاخد البيانات، تحفظها، وتفتح المودال
        openAddChildModal: (childData?: ChildProfileData | null) => {
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