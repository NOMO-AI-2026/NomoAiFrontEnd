import { useState } from "react";
import { PlusCircle } from "lucide-react";
import ChildCard from "../../components/ChildCard/ChildCard";
import styles from "./DoctorChildren.module.css";

const DoctorChildren = () => {
  const [patients, setPatients] = useState([
    { id: 1, name: "ليو سميث", age: "5 سنوات", status: "نشط", lastSession: "اليوم 2:00 م" },
    { id: 2, name: "مايا تشين", age: "6 سنوات", status: "متأخر", lastSession: "غداً" },
    { id: 3, name: "جيمس ويلسون", age: "4 سنوات", status: "نشط", lastSession: "11 أكتوبر 2023" },
  ]);

  const handleDelete = (id: number) => {
    setPatients(patients.filter(patient => patient.id !== id));
  };

  return (
    <div className={styles.pageContent}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>سجل المرضى</h1>
          <p className={styles.pageSubtitle}>إدارة ومتابعة جميع الأطفال المعينين لك.</p>
        </div>
        <button className={styles.addBtn}>
          <PlusCircle size={20} />
          إضافة طفل جديد
        </button>
      </div>

      <div className={styles.patientsGrid}>
        {patients.map((patient) => (
          <ChildCard
            key={patient.id}
            id={patient.id}
            name={patient.name}
            age={patient.age}
            status={patient.status}
            lastSession={patient.lastSession}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default DoctorChildren;