export const mockTeams = [
  {
    team_id: "T001",
    team_name: "Byte Me",
    members: [
      {
        name: "Asha Rao",
        resume_url: "https://drive.google.com/file/d/asharao-resume/view",
        github_url: "https://github.com/asharao",
        linkedin_url: null,
        portfolio_url: null
      },
      {
        name: "Dev Patel",
        resume_url: "https://drive.google.com/file/d/devpatel-cv/view",
        github_url: "https://github.com/devpatel-dev",
        linkedin_url: "https://linkedin.com/in/devpatel",
        portfolio_url: null
      }
    ],
    flags: {
      resume: "OK",
      github: "OK",
      linkedin: "MISSING",
      portfolio: "MISSING"
    }
  },
  {
    team_id: "T002",
    team_name: "Solo Hacker",
    members: [
      {
        name: "Karan Verma",
        resume_url: "https://drive.google.com/file/d/karan-resume/view",
        github_url: "https://github.com/karanverma",
        linkedin_url: "https://linkedin.com/in/karanverma",
        portfolio_url: "https://karanv.dev"
      }
    ],
    flags: {
      resume: "OK",
      github: "OK",
      linkedin: "OK",
      portfolio: "OK"
    }
  },
  {
    team_id: "T003",
    team_name: "Null Pointers",
    members: [
      {
        name: "Sneha Nair",
        resume_url: "not-a-valid-url-resume",
        github_url: "https://github.com/snehanair",
        linkedin_url: null,
        portfolio_url: null
      },
      {
        name: "Rohan Gupta",
        resume_url: "https://drive.google.com/file/d/rohan-cv/view",
        github_url: "https://github.com/rohangupta",
        linkedin_url: null,
        portfolio_url: null
      },
      {
        name: "Vikram Das",
        resume_url: null,
        github_url: null,
        linkedin_url: null,
        portfolio_url: null
      }
    ],
    flags: {
      resume: "INVALID",
      github: "OK",
      linkedin: "MISSING",
      portfolio: "MISSING"
    }
  },
  {
    team_id: "T004",
    team_name: "Kernel Panic",
    members: [
      {
        name: "Pooja Hegde",
        resume_url: null,
        github_url: null,
        linkedin_url: null,
        portfolio_url: null
      },
      {
        name: "Aditya Roy",
        resume_url: null,
        github_url: null,
        linkedin_url: null,
        portfolio_url: null
      }
    ],
    flags: {
      resume: "MISSING",
      github: "MISSING",
      linkedin: "MISSING",
      portfolio: "MISSING"
    }
  },
  {
    team_id: "T005",
    team_name: "MegaByte Squad",
    members: [
      {
        name: "Arjun Singh",
        resume_url: "https://drive.google.com/file/d/arjun-resume/view",
        github_url: "https://github.com/arjunsingh",
        linkedin_url: "https://linkedin.com/in/arjunsingh",
        portfolio_url: "https://arjun.dev"
      },
      {
        name: "Simran Kaur",
        resume_url: "https://drive.google.com/file/d/simran-resume/view",
        github_url: "https://github.com/simrankaur",
        linkedin_url: "https://linkedin.com/in/simrankaur",
        portfolio_url: null
      },
      {
        name: "Farhan Akhtar",
        resume_url: "https://drive.google.com/file/d/farhan-resume/view",
        github_url: "https://github.com/farhanakhtar",
        linkedin_url: "https://linkedin.com/in/farhanakhtar",
        portfolio_url: "https://farhan.tech"
      },
      {
        name: "Meera Joshi",
        resume_url: "https://drive.google.com/file/d/meera-resume/view",
        github_url: "https://github.com/meerajoshi",
        linkedin_url: null,
        portfolio_url: null
      },
      {
        name: "Aniket Sharma",
        resume_url: "https://drive.google.com/file/d/aniket-resume/view",
        github_url: "https://github.com/aniketsharma",
        linkedin_url: "https://linkedin.com/in/aniketsharma",
        portfolio_url: "https://aniket.io"
      }
    ],
    flags: {
      resume: "OK",
      github: "OK",
      linkedin: "OK",
      portfolio: "OK"
    }
  },
  {
    team_id: "T006",
    team_name: "Code Crafters",
    members: [
      {
        name: "Tanvi Deshmukh",
        resume_url: "https://drive.google.com/file/d/tanvi-resume/view",
        github_url: "https://github.com/tanvideshmukh",
        linkedin_url: "https://linkedin.com/in/tanvideshmukh",
        portfolio_url: null
      },
      {
        name: "Harsh Vardhan",
        resume_url: "https://drive.google.com/file/d/harsh-resume/view",
        github_url: "https://github.com/harshvardhan",
        linkedin_url: "https://linkedin.com/in/harshvardhan",
        portfolio_url: null
      },
      {
        name: "Isha Sundaram",
        resume_url: "https://drive.google.com/file/d/isha-resume/view",
        github_url: "https://github.com/ishasundaram",
        linkedin_url: null,
        portfolio_url: "https://isha.design"
      }
    ],
    flags: {
      resume: "OK",
      github: "OK",
      linkedin: "OK",
      portfolio: "OK"
    }
  },
  {
    team_id: "T007",
    team_name: "Syntax Terror",
    members: [
      {
        name: "Kabir Sen",
        resume_url: "https://drive.google.com/file/d/kabir-resume/view",
        github_url: "https://github.com/kabirsen",
        linkedin_url: null,
        portfolio_url: null
      },
      {
        name: "Neha Pillai",
        resume_url: "https://drive.google.com/file/d/neha-resume/view",
        github_url: null,
        linkedin_url: "https://linkedin.com/in/nehapillai",
        portfolio_url: null
      }
    ],
    flags: {
      resume: "OK",
      github: "OK",
      linkedin: "OK",
      portfolio: "MISSING"
    }
  },
  {
    team_id: "T008",
    team_name: "Stack Overflow",
    members: [
      {
        name: "Rishi Kapoor",
        resume_url: "https://drive.google.com/file/d/rishi-resume/view",
        github_url: null,
        linkedin_url: "https://linkedin.com/in/rishikapoor",
        portfolio_url: "https://rishi.dev"
      },
      {
        name: "Priya Sundar",
        resume_url: "https://drive.google.com/file/d/priya-cv/view",
        github_url: null,
        linkedin_url: "https://linkedin.com/in/priyasundar",
        portfolio_url: "https://priyasundar.design"
      }
    ],
    flags: {
      resume: "OK",
      github: "MISSING",
      linkedin: "OK",
      portfolio: "OK"
    }
  }
];
