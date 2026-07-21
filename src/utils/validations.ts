interface SignupFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  age: string | number;
  password: string;
}

export const validateSignup = (formData: SignupFormData) => {
  const errors: Record<string, string> = {};

  // 1. الاسم
  if (!formData.fullName.trim()) {
    errors.fullName = "الاسم الكامل مطلوب.";
  }

  // 2. الإيميل
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|net|org|edu|gov|io|co|info)$/i;
  
  // قائمة الدومينات الوهمية اللي مش عايزين نقبلها
  const fakeDomains = ['example.com', 'test.com', 'dummy.com', 'fake.com', 'email.com', '123.com'];
  
  if (!formData.email) {
    errors.email = "البريد الإلكتروني مطلوب.";
  } else if (!emailRegex.test(formData.email)) {
    errors.email = "يرجى إدخال بريد إلكتروني صحيح (مثل name@gmail.com).";
  } else {
    // لو الشكل صح، نتأكد إنه مش دومين وهمي
    const emailDomain = formData.email.split('@')[1]?.toLowerCase();
    if (fakeDomains.includes(emailDomain)) {
      errors.email = "يرجى استخدام بريد إلكتروني حقيقي (البريد الوهمي غير مقبول).";
    }
  }

  // 3. رقم الهاتف  
  const phoneRegex = /^01[0-9]{9}$/;
  
  if (!formData.phoneNumber) {
    errors.phoneNumber = "رقم الهاتف مطلوب.";
  } else if (!phoneRegex.test(formData.phoneNumber)) {
    errors.phoneNumber = "يجب أن يكون رقم الهاتف صحيحاً ومكوناً من 11 رقماً (يبدأ بـ 01).";
  }

  // 4. العمر
  if (!formData.age || Number(formData.age) < 18 || Number(formData.age) > 100) {
    errors.age = "يجب أن يكون العمر 18 عاماً أو أكثر.";
  }

  // 5. الباسورد
  const password = formData.password;
  const hasLetter = /[a-zA-Z]/.test(password); 
  const hasNumber = /[0-9]/.test(password);    
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password); 
  const isLongEnough = password.length >= 8;   

  if (!password) {
    errors.password = "كلمة المرور مطلوبة.";
  } else if (!isLongEnough || !hasLetter || !hasNumber || !hasSpecialChar) {
    errors.password = "يجب أن تحتوي على (8 خانات، حرف، رقم، رمز مثل @#$).";
  }

  return errors;
};