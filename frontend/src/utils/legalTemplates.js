// src/utils/legalTemplates.js

export const legalTemplates = [
{
id: "rent_agreement",
label: "Residential Rent Agreement",
category: "Property & Housing",
fields: [
{ id: "landlordName", label: "Landlord Name", type: "text" },
{ id: "tenantName", label: "Tenant Name", type: "text" },
{ id: "propertyAddress", label: "Property Address", type: "text" },
{ id: "rentAmount", label: "Monthly Rent (₹)", type: "number" },
{ id: "depositAmount", label: "Security Deposit (₹)", type: "number" },
{ id: "startDate", label: "Start Date", type: "date" }
]
},

{
id: "leave_license",
label: "Leave and License Agreement",
category: "Property & Housing",
fields: [
{ id: "licensor", label: "Licensor Name", type: "text" },
{ id: "licensee", label: "Licensee Name", type: "text" },
{ id: "propertyAddress", label: "Licensed Property Address", type: "text" },
{ id: "licenseFee", label: "Monthly License Fee", type: "number" },
{ id: "duration", label: "Agreement Duration (Months)", type: "number" }
]
},

{
id: "sale_agreement",
label: "Property Sale Agreement",
category: "Property & Housing",
fields: [
{ id: "sellerName", label: "Seller Name", type: "text" },
{ id: "buyerName", label: "Buyer Name", type: "text" },
{ id: "propertyDetails", label: "Property Description", type: "text" },
{ id: "saleAmount", label: "Sale Amount (₹)", type: "number" },
{ id: "advanceAmount", label: "Advance Amount Paid (₹)", type: "number" }
]
},

{
id: "money_recovery",
label: "Legal Notice for Money Recovery",
category: "Disputes",
fields: [
{ id: "creditorName", label: "Creditor Name", type: "text" },
{ id: "debtorName", label: "Debtor Name", type: "text" },
{ id: "amount", label: "Amount Owed (₹)", type: "number" },
{ id: "reason", label: "Reason for Debt", type: "text" },
{ id: "dueDate", label: "Payment Due Date", type: "date" }
]
},

{
id: "legal_notice",
label: "General Legal Notice",
category: "Disputes",
fields: [
{ id: "senderName", label: "Sender Name", type: "text" },
{ id: "receiverName", label: "Receiver Name", type: "text" },
{ id: "subject", label: "Notice Subject", type: "text" },
{ id: "details", label: "Notice Details", type: "textarea" }
]
},

{
id: "promissory_note",
label: "Promissory Note",
category: "Finance",
fields: [
{ id: "lender", label: "Lender Name", type: "text" },
{ id: "borrower", label: "Borrower Name", type: "text" },
{ id: "loanAmount", label: "Loan Amount", type: "number" },
{ id: "interestRate", label: "Interest Rate (%)", type: "number" },
{ id: "repaymentDate", label: "Repayment Date", type: "date" }
]
},

{
id: "loan_agreement",
label: "Loan Agreement",
category: "Finance",
fields: [
{ id: "lenderName", label: "Lender Name", type: "text" },
{ id: "borrowerName", label: "Borrower Name", type: "text" },
{ id: "loanAmount", label: "Loan Amount", type: "number" },
{ id: "loanPurpose", label: "Purpose of Loan", type: "text" },
{ id: "repaymentTerms", label: "Repayment Terms", type: "text" }
]
},

{
id: "employment_contract",
label: "Employment Contract",
category: "Employment",
fields: [
{ id: "companyName", label: "Company Name", type: "text" },
{ id: "employeeName", label: "Employee Name", type: "text" },
{ id: "position", label: "Job Position", type: "text" },
{ id: "salary", label: "Monthly Salary", type: "number" },
{ id: "joiningDate", label: "Joining Date", type: "date" }
]
},

{
id: "experience_letter",
label: "Experience Letter",
category: "Employment",
fields: [
{ id: "employeeName", label: "Employee Name", type: "text" },
{ id: "companyName", label: "Company Name", type: "text" },
{ id: "designation", label: "Designation", type: "text" },
{ id: "startDate", label: "Start Date", type: "date" },
{ id: "endDate", label: "End Date", type: "date" }
]
},

{
id: "resignation_letter",
label: "Resignation Letter",
category: "Employment",
fields: [
{ id: "employeeName", label: "Employee Name", type: "text" },
{ id: "companyName", label: "Company Name", type: "text" },
{ id: "designation", label: "Designation", type: "text" },
{ id: "lastWorkingDay", label: "Last Working Day", type: "date" }
]
},

{
id: "affidavit_name_change",
label: "Affidavit for Name Change",
category: "Personal",
fields: [
{ id: "oldName", label: "Old Name", type: "text" },
{ id: "newName", label: "New Name", type: "text" },
{ id: "fatherName", label: "Father / Husband Name", type: "text" },
{ id: "address", label: "Address", type: "text" },
{ id: "reason", label: "Reason for Change", type: "text" }
]
},

{
id: "marriage_affidavit",
label: "Marriage Affidavit",
category: "Personal",
fields: [
{ id: "husbandName", label: "Husband Name", type: "text" },
{ id: "wifeName", label: "Wife Name", type: "text" },
{ id: "marriageDate", label: "Marriage Date", type: "date" },
{ id: "marriagePlace", label: "Marriage Place", type: "text" }
]
},

{
id: "address_proof_affidavit",
label: "Address Proof Affidavit",
category: "Personal",
fields: [
{ id: "personName", label: "Full Name", type: "text" },
{ id: "address", label: "Current Address", type: "text" },
{ id: "duration", label: "Duration of Stay", type: "text" }
]
},

{
id: "special_poa",
label: "Special Power of Attorney",
category: "Legal Authority",
fields: [
{ id: "principalName", label: "Principal Name", type: "text" },
{ id: "attorneyName", label: "Attorney Name", type: "text" },
{ id: "relation", label: "Relation", type: "text" },
{ id: "task", label: "Authorized Task", type: "text" }
]
},

{
id: "general_poa",
label: "General Power of Attorney",
category: "Legal Authority",
fields: [
{ id: "principal", label: "Principal Name", type: "text" },
{ id: "agent", label: "Agent Name", type: "text" },
{ id: "powers", label: "Granted Powers", type: "textarea" }
]
},

{
id: "partnership_deed",
label: "Partnership Deed",
category: "Business",
fields: [
{ id: "partner1", label: "Partner 1 Name", type: "text" },
{ id: "partner2", label: "Partner 2 Name", type: "text" },
{ id: "businessName", label: "Business Name", type: "text" },
{ id: "profitShare", label: "Profit Sharing Ratio", type: "text" }
]
},

{
id: "non_disclosure",
label: "Non Disclosure Agreement (NDA)",
category: "Business",
fields: [
{ id: "party1", label: "Party 1 Name", type: "text" },
{ id: "party2", label: "Party 2 Name", type: "text" },
{ id: "confidentialInfo", label: "Confidential Information Description", type: "textarea" },
{ id: "duration", label: "Agreement Duration", type: "text" }
]
},

{
id: "service_agreement",
label: "Service Agreement",
category: "Business",
fields: [
{ id: "serviceProvider", label: "Service Provider", type: "text" },
{ id: "client", label: "Client Name", type: "text" },
{ id: "serviceDescription", label: "Service Description", type: "textarea" },
{ id: "paymentAmount", label: "Payment Amount", type: "number" }
]
},

{
id: "divorce_mutual",
label: "Mutual Divorce Agreement",
category: "Family Law",
fields: [
{ id: "husbandName", label: "Husband Name", type: "text" },
{ id: "wifeName", label: "Wife Name", type: "text" },
{ id: "marriageDate", label: "Marriage Date", type: "date" },
{ id: "separationDate", label: "Separation Date", type: "date" }
]
},

{
id: "child_custody",
label: "Child Custody Agreement",
category: "Family Law",
fields: [
{ id: "fatherName", label: "Father Name", type: "text" },
{ id: "motherName", label: "Mother Name", type: "text" },
{ id: "childName", label: "Child Name", type: "text" },
{ id: "custodyType", label: "Custody Type", type: "text" }
]
}
];