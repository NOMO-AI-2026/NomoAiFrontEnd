import { describe, it, expect } from 'vitest';
import { validateSignup } from './validations';

describe('validateSignup', () => {
  const validFormData = {
    fullName: 'Test User',
    email: 'test@gmail.com',
    phoneNumber: '01012345678',
    age: 25,
    password: 'Password123!',
    role: 1, // Not a doctor
  };

  it('should return no errors for valid data', () => {
    const errors = validateSignup(validFormData);
    expect(Object.keys(errors).length).toBe(0);
  });

  describe('fullName validation', () => {
    it('should return error if fullName is empty', () => {
      const errors = validateSignup({ ...validFormData, fullName: '' });
      expect(errors.fullName).toBe('الاسم الكامل مطلوب.');
    });

    it('should return error if fullName is only whitespace', () => {
      const errors = validateSignup({ ...validFormData, fullName: '   ' });
      expect(errors.fullName).toBe('الاسم الكامل مطلوب.');
    });
  });

  describe('email validation', () => {
    it('should return error if email is empty', () => {
      const errors = validateSignup({ ...validFormData, email: '' });
      expect(errors.email).toBe('البريد الإلكتروني مطلوب.');
    });

    it('should return error if email format is invalid', () => {
      const errors = validateSignup({ ...validFormData, email: 'invalid-email' });
      expect(errors.email).toBe('يرجى إدخال بريد إلكتروني صحيح (مثل name@gmail.com).');
    });

    it('should return error for fake domains', () => {
      const errors = validateSignup({ ...validFormData, email: 'test@example.com' });
      expect(errors.email).toBe('يرجى استخدام بريد إلكتروني حقيقي (البريد الوهمي غير مقبول).');
    });
  });

  describe('phoneNumber validation', () => {
    it('should return error if phoneNumber is empty', () => {
      const errors = validateSignup({ ...validFormData, phoneNumber: '' });
      expect(errors.phoneNumber).toBe('رقم الهاتف مطلوب.');
    });

    it('should return error if phoneNumber does not start with 01 or has wrong length', () => {
      const errors = validateSignup({ ...validFormData, phoneNumber: '02012345678' });
      expect(errors.phoneNumber).toBe('يجب أن يكون رقم الهاتف صحيحاً ومكوناً من 11 رقماً (يبدأ بـ 01).');
    });
  });

  describe('age validation', () => {
    it('should return error if age is empty', () => {
      const errors = validateSignup({ ...validFormData, age: '' });
      expect(errors.age).toBe('يجب أن يكون العمر 18 عاماً أو أكثر.');
    });

    it('should return error if age is less than 18', () => {
      const errors = validateSignup({ ...validFormData, age: 17 });
      expect(errors.age).toBe('يجب أن يكون العمر 18 عاماً أو أكثر.');
    });

    it('should return error if age is greater than 100', () => {
      const errors = validateSignup({ ...validFormData, age: 101 });
      expect(errors.age).toBe('يجب أن يكون العمر 18 عاماً أو أكثر.');
    });
  });

  describe('password validation', () => {
    it('should return error if password is empty', () => {
      const errors = validateSignup({ ...validFormData, password: '' });
      expect(errors.password).toBe('كلمة المرور مطلوبة.');
    });

    it('should return error if password is too short', () => {
      const errors = validateSignup({ ...validFormData, password: 'Pass1!' });
      expect(errors.password).toBe('يجب أن تحتوي على (8 خانات، حرف، رقم، رمز مثل @#$).');
    });

    it('should return error if password lacks a number', () => {
      const errors = validateSignup({ ...validFormData, password: 'Password!' });
      expect(errors.password).toBe('يجب أن تحتوي على (8 خانات، حرف، رقم، رمز مثل @#$).');
    });

    it('should return error if password lacks a letter', () => {
      const errors = validateSignup({ ...validFormData, password: '12345678!' });
      expect(errors.password).toBe('يجب أن تحتوي على (8 خانات، حرف، رقم، رمز مثل @#$).');
    });

    it('should return error if password lacks a special character', () => {
      const errors = validateSignup({ ...validFormData, password: 'Password123' });
      expect(errors.password).toBe('يجب أن تحتوي على (8 خانات، حرف، رقم، رمز مثل @#$).');
    });
  });

  describe('doctor specific validation', () => {
    const doctorFormData = { ...validFormData, role: 0 };
    
    // Create dummy file objects
    const createDummyFile = (size: number) => ({ size } as File);

    it('should return error if practiceLicense is missing', () => {
      const errors = validateSignup(doctorFormData);
      expect(errors.practiceLicense).toBe('ترخيص ممارسة المهنة مطلوب (ملف PDF أو صورة).');
    });

    it('should return error if practiceLicense is too large', () => {
      const errors = validateSignup({ 
        ...doctorFormData, 
        practiceLicense: createDummyFile(6 * 1024 * 1024) 
      });
      expect(errors.practiceLicense).toBe('حجم ترخيص ممارسة المهنة يجب ألا يتجاوز 5 ميجابايت.');
    });

    it('should return error if syndicateCard is missing', () => {
      const errors = validateSignup({ 
        ...doctorFormData,
        practiceLicense: createDummyFile(1024),
      });
      expect(errors.syndicateCard).toBe('كارنيه النقابة مطلوب (ملف PDF أو صورة).');
    });

    it('should return error if syndicateCard is too large', () => {
      const errors = validateSignup({ 
        ...doctorFormData, 
        practiceLicense: createDummyFile(1024),
        syndicateCard: createDummyFile(6 * 1024 * 1024) 
      });
      expect(errors.syndicateCard).toBe('حجم كارنيه النقابة يجب ألا يتجاوز 5 ميجابايت.');
    });

    it('should return no errors if doctor files are valid', () => {
      const errors = validateSignup({ 
        ...doctorFormData, 
        practiceLicense: createDummyFile(1024),
        syndicateCard: createDummyFile(1024) 
      });
      expect(Object.keys(errors).length).toBe(0);
    });
  });
});
