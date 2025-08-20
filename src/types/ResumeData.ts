export interface PersonalInfo {
  name: string;
  title: string;
}

export interface ContactInfo extends Array<string> {}

export interface Experience {
  position: string;
  company: string;
  duration: string;
  achievements: string[];
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  contactInfo: ContactInfo;
  experience: Experience[];
  skills: string[];
  achievements: string[];
}
