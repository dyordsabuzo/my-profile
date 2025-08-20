// import { useState } from "react";
import { generatePDF } from "../../utils/pdf";
import { rgb } from "pdf-lib";

export default function ReactButton() {
  // const [count, setCount] = useState(0);
  // const [message, setMessage] = useState('');

  // Resume data structure
  const resumeData = {
    personalInfo: {
      name: "John Doe",
      title:
        "Senior Software Engineer | Devpops Engineer | System architecture",
    },
    contactInfo: [
      "Email: john.doe@example.com",
      "Phone: +1 234 567 890",
      "LinkedIn: linkedin.com/in/johndoe",
      "GitHub: github.com/johndoe",
    ],
    experience: [
      {
        company: "Acme Corp",
        duration: "2020 - Present",
        position: "Senior Software Engineer",
        achievements: [
          "Lead developer for e-commerce platform jusd tringtong to sedfwe asdjkhdg happens with oihasdklghdfgkluhkldfvbk klbaskdufghekjlkjb blucew",
          "Implemented microservices architecture",
          "Lead developer for e-commerce platform jusd tringtong to sedfwe asdjkhdg happens with oihasdklghdfgkluhkldfvbk klbaskdufghekjlkjb blucew",
        ],
      },
      {
        company: "Tech Startup",
        duration: "2018 - 2020",
        position: "Full Stack Developer",
        achievements: [
          "Designed REST APIs and database schemas",
          "Developed scalable backend services",
        ],
      },
    ],
    skills: [
      "JavaScript/TypeScript",
      "React/Node.js",
      "AWS/GCP",
      "CI/CD Pipelines",
      "Microservices Architecture",
      "REST API Design",
    ],
    achievements: [
      "Reduced API response time by 60% adfsdfhas lkehfalsukfhalskdfgh alsdkfghlasd kufhldkuhaflskuf halisdhuflas",
      "Implemented automated testing framework",
      "Led team of 5 developers",
      "Improved system reliability to 99.99% uptime",
      "Reduced server costs by 30% through optimization",
    ],
  };

  // Layout configuration
  const layoutConfig = {
    pageSize: [595, 842], // A4 size in points
    margins: {
      top: 30,
      left: 30,
      right: 30,
      bottom: 30,
    },
    columnWidthRatio: 0.3,
    defaultLineHeight: 14,
    colors: {
      sectionDivider: rgb(0.4, 0.4, 0.4),
      name: rgb(0.2, 0.2, 0.2),
      title: rgb(0.4, 0.4, 0.4),
      contactInfo: rgb(0.4, 0.4, 0.4),
      experienceDetails: rgb(0.5, 0.5, 0.5),
      itemDivider: rgb(0.93, 0.93, 0.93),
    },
    fonts: {
      normal: "Roboto",
      bold: "Roboto-Bold",
    },
    sizes: {
      name: 20,
      title: 12,
      sectionHeader: 14,
      experienceCompany: 10,
      experiencePosition: 11,
      listItem: 11,
      contactInfo: 8,
      achievementItem: 9,
    },
    spacing: {
      nameToTitle: 18,
      titleToContact: 14,
      contactItem: 14,
      experienceToPosition: 16,
      positionToAchievements: 16,
      achievementItem: 14,
      experienceBlock: 10,
      sectionToContent: 25,
      skillItem: 14,
      achievementBlock: 14,
      sectionDivider: 20,
    },
  };

  const handleClick = async () => {
    // setCount(prev => prev + 1);
    // setMessage(`Button clicked ${count + 1} times!`);
    //
    //
    try {
      const pdfDoc = await generatePDF(resumeData, layoutConfig);
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "resume.pdf";
      link.click();
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        class="inline-flex items-center justify-center px-10 py-4 text-base text-white
          font-semibold transition-all duration-200 rounded
          bg-primary hover:bg-secondary focus:bg-secondary"
      >
        Download CSV
      </button>
    </div>
  );
}
