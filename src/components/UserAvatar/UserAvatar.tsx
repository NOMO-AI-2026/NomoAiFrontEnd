import React from 'react';
import { FaUserDoctor } from 'react-icons/fa6';
import { RiParentFill } from 'react-icons/ri';
import { CgBoy, CgGirl } from 'react-icons/cg';
import styles from './UserAvatar.module.css';

export interface UserAvatarProps {
  type?: 'child' | 'parent' | 'doctor';
  gender?: number | string; // 0/'male'/'ذكر' for boy, 1/'female'/'أنثى' for girl
  size?: number;
  className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  type = 'child',
  gender,
  size = 22,
  className = ''
}) => {
  const isFemale = gender === 1 || gender === '1' || gender === 'female' || gender === 'أنثى';

  const iconStyle: React.CSSProperties = {
    display: 'block',
    width: `${size}px`,
    height: `${size}px`,
    flexShrink: 0
  };

  const combinedClass = `${styles.icon} ${className}`.trim();

  if (type === 'doctor') {
    return <FaUserDoctor style={iconStyle} className={combinedClass} />;
  }

  if (type === 'parent') {
    return <RiParentFill style={iconStyle} className={combinedClass} />;
  }

  // Child: CgGirl for female, CgBoy for male
  if (isFemale) {
    return <CgGirl style={iconStyle} className={combinedClass} />;
  }

  return <CgBoy style={iconStyle} className={combinedClass} />;
};

export default UserAvatar;
