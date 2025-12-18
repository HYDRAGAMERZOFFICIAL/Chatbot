# Keyword Mapping Examples

## Complete Keyword Reference

This document shows exactly which keywords from your JSON data trigger which responses.

---

## 1. INTENT KEYWORDS (28 Intents)

### Admission & Registration
```
"apply" → admission_process
"admission" → admission_documents, admission_process
"application" → admission_process
"how to apply" → admission_process
"registration" → admission_process
"enroll" → admission_process
"certificate" → admission_documents
"marksheet" → admission_documents
"tc" → admission_documents
"documents" → admission_documents
"required documents" → admission_documents
"photo id" → admission_documents
"aadhar" → admission_documents
"passport" → admission_documents
```

### Facilities & Campus Life
```
"hostel" → hostel_facility
"accommodation" → hostel_facility
"stay" → hostel_facility
"boys hostel" → hostel_facility
"girls hostel" → hostel_facility
"dormitory" → hostel_facility
"rooms" → hostel_facility
"boarding" → hostel_facility

"cctv" → campus_security
"security" → campus_security
"safe" → campus_security
"safety" → campus_security
"guards" → campus_security
"campus security" → campus_security
"protection" → campus_security
```

### Academics & Fees
```
"fees" → fee_structure
"cost" → fee_structure
"price" → fee_structure
"payment" → fee_structure
"tuition" → fee_structure
"charges" → fee_structure
"how much" → fee_structure
"installment" → fee_structure
"scholarship" → fee_structure
"cgpa" → academic_performance

"portal" → student_portal
"login" → student_portal
"attendance" → student_portal
"results" → student_portal
"online" → student_portal
"grades" → student_portal
"marks" → student_portal

"remedial" → remedial_classes
"extra classes" → remedial_classes
"support" → remedial_classes
"weak" → remedial_classes
"help" → remedial_classes
"tuition" → remedial_classes
"coaching" → remedial_classes
"struggling" → remedial_classes
```

### Placements & Careers
```
"placement" → placement_statistics
"job" → placement_statistics
"recruitment" → placement_statistics
"salary" → placement_statistics
"company" → placement_statistics
"recruited" → placement_statistics

"internship" → internship_opportunities
"training" → internship_opportunities
"industry" → internship_opportunities

"alumni" → alumni_network
"graduate" → alumni_network
"past student" → alumni_network
```

### Other Facilities
```
"library" → library_facilities
"books" → library_facilities
"study" → library_facilities
"research" → library_facilities

"lab" → laboratory_facilities
"equipment" → laboratory_facilities
"practical" → laboratory_facilities
"experiment" → laboratory_facilities

"sports" → sports_facilities
"gym" → sports_facilities
"swimming" → sports_facilities
"recreation" → sports_facilities

"cafeteria" → food_services
"food" → food_services
"meal" → food_services
"nutrition" → food_services

"wifi" → technology_infrastructure
"internet" → technology_infrastructure
"electricity" → technology_infrastructure

"club" → student_clubs
"activity" → student_clubs
"cultural" → student_clubs
"event" → student_clubs

"counselor" → counseling_services
"mental health" → counseling_services
"stress" → counseling_services

"medical" → medical_services
"doctor" → medical_services
"health" → medical_services
"clinic" → medical_services

"transport" → transportation
"bus" → transportation
"shuttle" → transportation
"commute" → transportation

"contact" → contact_information
"phone" → contact_information
"number" → contact_information
"call" → contact_information
"email" → contact_information
"address" → contact_information

"location" → campus_location
"where" → campus_location
"situated" → campus_location
"city" → campus_location
"area" → campus_location
"direction" → campus_location
```

---

## 2. FAQ KEYWORDS (Tags from FAQ.json)

```
"courses" → What courses are offered?
"programs" → What courses are offered?
"engineering" → What courses are offered?
"degrees" → What courses are offered?

"admission" → How can I apply for admission?
"application" → How can I apply for admission?
"enrollment" → How can I apply for admission?
"online" → How can I apply for admission?
"apply" → How can I apply for admission?

"hostel" → Is hostel facility available?
"accommodation" → Is hostel facility available?
"facilities" → Is hostel facility available?
"residential" → Is hostel facility available?
"stay" → Is hostel facility available?

"placement" → What is the placement rate?
"job" → What is the placement rate?
"recruitment" → What is the placement rate?
"salary" → What is the placement rate?
"career" → What is the placement rate?
"employment" → What is the placement rate?

"fees" → What is the fee structure?
"tuition" → What is the fee structure?
"payment" → What is the fee structure?
"scholarship" → What is the fee structure?
"cost" → What is the fee structure?
"charges" → What is the fee structure?
"installment" → What is the fee structure?

"financial aid" → Are there scholarships available?
"support" → Are there scholarships available?
"grants" → Are there scholarships available?
"merit" → Are there scholarships available?
"need-based" → Are there scholarships available?
"waiver" → Are there scholarships available?

"library" → What are the library facilities?
"resources" → What are the library facilities?
"study" → What are the library facilities?
"books" → What are the library facilities?
"digital" → What are the library facilities?
"research" → What are the library facilities?
"journals" → What are the library facilities?

"sports" → Are there sports facilities on campus?
"recreation" → Are there sports facilities on campus?
"activities" → Are there sports facilities on campus?
"gym" → Are there sports facilities on campus?
"fitness" → Are there sports facilities on campus?
"swimming" → Are there sports facilities on campus?
```

---

## 3. PROGRAM KEYWORDS (Auto-Indexed)

### B.Tech CSE Keywords
```
"b.tech computer science" → B.Tech CSE Program Details
"cse" → B.Tech CSE Program Details
"computer science" → B.Tech CSE Program Details
"data structures" → B.Tech CSE Program Details
"algorithms" → B.Tech CSE Program Details
"database management" → B.Tech CSE Program Details
"operating systems" → B.Tech CSE Program Details
"computer networks" → B.Tech CSE Program Details
"web development" → B.Tech CSE Program Details
"software engineering" → B.Tech CSE Program Details
"machine learning" → B.Tech CSE Program Details

"ai/ml" → B.Tech CSE (Specialization)
"artificial intelligence" → B.Tech CSE (Specialization)
"cloud computing" → B.Tech CSE (Specialization)
"data science" → B.Tech CSE (Specialization)
"cybersecurity" → B.Tech CSE (Specialization)
"devops" → B.Tech CSE (Specialization)
```

### B.Tech ECE Keywords
```
"b.tech electronics" → B.Tech ECE Program Details
"ece" → B.Tech ECE Program Details
"electronics and communication" → B.Tech ECE Program Details
"circuit analysis" → B.Tech ECE Program Details
"signals and systems" → B.Tech ECE Program Details
"electromagnetic theory" → B.Tech ECE Program Details
"digital electronics" → B.Tech ECE Program Details
"communication systems" → B.Tech ECE Program Details
"microprocessor" → B.Tech ECE Program Details
"vlsi design" → B.Tech ECE Program Details

"iot" → B.Tech ECE (Specialization)
"5g communication" → B.Tech ECE (Specialization)
"embedded systems" → B.Tech ECE (Specialization)
"power electronics" → B.Tech ECE (Specialization)
```

### B.Tech Mechanical Keywords
```
"b.tech mechanical" → B.Tech Mechanical Program Details
"mechanical engineering" → B.Tech Mechanical Program Details
"thermodynamics" → B.Tech Mechanical Program Details
"fluid mechanics" → B.Tech Mechanical Program Details
"machine design" → B.Tech Mechanical Program Details
"heat transfer" → B.Tech Mechanical Program Details
"cad/cam" → B.Tech Mechanical Program Details
"control systems" → B.Tech Mechanical Program Details
"manufacturing technology" → B.Tech Mechanical Program Details

"thermal engineering" → B.Tech Mechanical (Specialization)
"manufacturing" → B.Tech Mechanical (Specialization)
"robotics" → B.Tech Mechanical (Specialization)
"automotive engineering" → B.Tech Mechanical (Specialization)
"energy engineering" → B.Tech Mechanical (Specialization)
```

### B.Tech Civil Keywords
```
"b.tech civil" → B.Tech Civil Program Details
"civil engineering" → B.Tech Civil Program Details
"structural analysis" → B.Tech Civil Program Details
"concrete design" → B.Tech Civil Program Details
"geotechnical engineering" → B.Tech Civil Program Details
"water resources" → B.Tech Civil Program Details
"transportation engineering" → B.Tech Civil Program Details
"building technology" → B.Tech Civil Program Details

"structural engineering" → B.Tech Civil (Specialization)
"smart cities" → B.Tech Civil (Specialization)
"sustainable infrastructure" → B.Tech Civil (Specialization)
```

### B.Tech Electrical Keywords
```
"b.tech electrical" → B.Tech Electrical Program Details
"electrical engineering" → B.Tech Electrical Program Details
"circuit theory" → B.Tech Electrical Program Details
"electromagnetic fields" → B.Tech Electrical Program Details
"power systems" → B.Tech Electrical Program Details
"electrical machines" → B.Tech Electrical Program Details
"power electronics" → B.Tech Electrical Program Details

"renewable energy" → B.Tech Electrical (Specialization)
"smart grid" → B.Tech Electrical (Specialization)
"industrial automation" → B.Tech Electrical (Specialization)
```

### MBA Keywords
```
"mba" → MBA Program Details
"master of business administration" → MBA Program Details
"business management" → MBA Program Details
"finance" → MBA (Specialization)
"marketing" → MBA (Specialization)
"operations" → MBA (Specialization)
"business analytics" → MBA (Specialization)
"international business" → MBA (Specialization)
```

### MCA Keywords
```
"mca" → MCA Program Details
"master of computer applications" → MCA Program Details
"advanced programming" → MCA Program Details
"cloud computing" → MCA (Specialization)
"data science" → MCA (Specialization)
"ai/ml" → MCA (Specialization)
"full stack development" → MCA (Specialization)
"cybersecurity" → MCA (Specialization)
```

### B.Sc Keywords
```
"b.sc" → B.Sc Program Details
"bachelor of science" → B.Sc Program Details
"science" → B.Sc Program Details
"physics" → B.Sc (Specialization)
"chemistry" → B.Sc (Specialization)
"biology" → B.Sc (Specialization)
"microbiology" → B.Sc (Specialization)
```

---

## 4. INTERNSHIP KEYWORDS (Auto-Indexed)

### Summer Internship Keywords
```
"summer internship" → Summer Internship Details
"8-10 weeks" → Summer Internship Details
"may-july" → Summer Internship Details
"10-20k" → Summer Internship Details
"software development" → Summer Internship (Domain)
"data science" → Summer Internship (Domain)
"ai/ml" → Summer Internship (Domain)
"web development" → Summer Internship (Domain)
"devops" → Summer Internship (Domain)
"cloud computing" → Summer Internship (Domain)
```

### Semester Internship Keywords
```
"semester internship" → Semester Internship Details
"12-16 weeks" → Semester Internship Details
"january-april" → Semester Internship Details
"august-november" → Semester Internship Details
"ppo" → Semester Internship Details (Pre-Placement Offer)
"conversion" → Semester Internship Details
"final year" → Semester Internship Details
"15-25k" → Semester Internship Details
```

### Research Internship Keywords
```
"research internship" → Research Internship Details
"4-6 months" → Research Internship Details
"8.5 cgpa" → Research Internship Details
"publication" → Research Internship Details
"phd" → Research Internship Details
"ai/ml research" → Research Internship (Domain)
"computer vision" → Research Internship (Domain)
"nlp" → Research Internship (Domain)
"iot research" → Research Internship (Domain)
```

### Startup Internship Keywords
```
"startup internship" → Startup Internship Details
"3-6 months" → Startup Internship Details
"flexible" → Startup Internship Details
"equity" → Startup Internship Details
"esop" → Startup Internship Details
"product development" → Startup Internship (Domain)
"marketing" → Startup Internship (Domain)
"business development" → Startup Internship (Domain)
"ui/ux design" → Startup Internship (Domain)
```

### Final Year Project Keywords
```
"final year project" → Final Year Project as Internship Details
"7th semester" → Final Year Project Details
"8th semester" → Final Year Project Details
"embedded systems" → Final Year Project (Domain)
"robotics" → Final Year Project (Domain)
"iot" → Final Year Project (Domain)
```

### International Internship Keywords
```
"international internship" → International Internship Details
"6-12 weeks" → International Internship Details
"july-september" → International Internship Details
"800-2000" → International Internship Details (USD)
"visa sponsorship" → International Internship Details
"global experience" → International Internship Details
"7.5 cgpa" → International Internship Details
```

---

## 5. HOW TO USE THIS REFERENCE

### Example 1: User asks "Tell me about CSE"
1. Extract keywords: ["tell", "me", "about", "cse"]
2. Lookup "cse" in index
3. Found: B.Tech CSE Program Keywords
4. Returns: Complete CSE program details

### Example 2: User asks "I need scholarship"
1. Extract keywords: ["need", "scholarship"]
2. Lookup "scholarship" in index
3. Found: fee_structure intent + FAQ scholarship answer
4. Returns: Scholarship information + application process

### Example 3: User asks "Summer internship"
1. Extract keywords: ["summer", "internship"]
2. Lookup "summer" + "internship"
3. Found: Summer Internship Keywords
4. Returns: Summer internship details

### Example 4: User asks "How do I apply?"
1. Extract keywords: ["apply"]
2. Lookup "apply" in index
3. Found: admission_process intent
4. Returns: Application step-by-step guide

---

## 6. KEYWORD PRIORITY

When multiple keywords match, priority is:
1. **Exact match** (complete keyword = query word) → Confidence: 0.95
2. **Partial match** (keyword contains query word) → Confidence: 0.85
3. **Substring match** (similar keyword) → Confidence: 0.70

---

## 7. ADDING MORE KEYWORDS

### To Intent
Edit `src/data/json/intents.json`:
```json
{
  "keywords": ["new_keyword1", "new_keyword2"],
  "answer": "Your response here..."
}
```

### To FAQ
Edit `src/data/json/faq.json`:
```json
{
  "tags": ["new_tag1", "new_tag2"],
  "answer": "Your answer here..."
}
```

### To Program
Edit `src/data/json/programs.json`:
```json
{
  "specializations": ["new_specialization"],
  "coreSubjects": ["new_subject"]
}
```

### To Internship
Edit `src/data/json/internships.json`:
```json
{
  "domains": ["new_domain"]
}
```

---

**Total Keywords Indexed: 200+**
**Automatic Rebuild: On first query after system restart**
**Performance: O(1) lookup time**

---

*Last Updated: December 18, 2025*
