# Nova Creations - Employee Portal

A production-ready employee onboarding and self-service portal built with Next.js 14, TypeScript, Tailwind CSS, and PostgreSQL.

## 🚀 Features

### Admin Dashboard
- View and manage all employees
- Track onboarding progress with visual indicators
- Invite new employees via email
- Create, edit, and delete announcements
- Configure onboarding steps and agreement templates

### Employee Onboarding Flow
A 5-step wizard for new employee onboarding:
1. **Personal Information** - Name, DOB, phone, address, emergency contact
2. **Bank & Payment Info** - Direct deposit details with validation
3. **Employment Details** - Role, start date, compensation type
4. **Agreements & Documents** - Sign required documents, upload ID
5. **Review & Submit** - Final review before completion

### Employee Portal
- Welcome dashboard with announcements
- Profile management (editable contact info)
- Bank details viewing and updating
- Document history and agreements

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: Custom JWT implementation with HTTP-only cookies
- **Validation**: Zod schemas

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

## ⚡ Quick Start

### 1. Clone and install dependencies

```bash
cd "Employee Portal"
npm install
```

### 2. Set up environment variables

Create a `.env` file in the project root:

```env
# Database connection string
DATABASE_URL="postgresql://username:password@localhost:5432/nova_creations?schema=public"

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Set up the database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (or use migrate for production)
npm run db:push

# Seed the database with sample data
npm run db:seed
```

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 👤 Demo Credentials

After running the seed, you can log in with:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@novacreations.com | admin123 |
| Employee (Completed) | sarah.johnson@novacreations.com | employee123 |
| Employee (In Progress) | james.wilson@novacreations.com | employee123 |
| Employee (Not Started) | alex.chen@novacreations.com | employee123 |

## 📁 Project Structure

```
src/
├── app/
│   ├── admin/                    # Admin pages
│   │   ├── announcements/        # Announcements CRUD
│   │   ├── employees/            # Employee list & details
│   │   └── settings/             # System settings
│   ├── api/                      # API routes
│   │   ├── admin/                # Admin-only endpoints
│   │   ├── auth/                 # Login/logout
│   │   ├── onboarding/           # Onboarding step handlers
│   │   └── portal/               # Employee self-service
│   ├── login/                    # Login page
│   ├── onboarding/               # Onboarding wizard
│   │   └── steps/                # Individual step components
│   └── portal/                   # Employee portal
│       ├── documents/            # View agreements/uploads
│       ├── payment/              # Bank details
│       └── profile/              # Edit profile
├── components/
│   ├── layouts/                  # AdminLayout, PortalLayout
│   └── ui/                       # Reusable UI components
├── lib/
│   ├── auth.ts                   # Authentication utilities
│   ├── db.ts                     # Prisma client
│   ├── utils.ts                  # Helper functions
│   └── validations.ts            # Zod schemas
└── middleware.ts                 # Route protection
```

## 🔐 Authentication & Authorization

- JWT-based authentication with HTTP-only cookies
- Role-based access control (ADMIN / EMPLOYEE)
- Middleware protection for all authenticated routes
- Automatic redirects based on role and onboarding status

## 📊 Database Schema

The application uses the following main entities:

- **User** - Authentication and role management
- **EmployeeProfile** - Personal and employment information
- **BankDetails** - Payment information for payroll
- **OnboardingStepTemplate** - Configurable onboarding steps
- **EmployeeOnboardingStep** - Track progress per employee
- **AgreementTemplate** - Documents employees must sign
- **EmployeeAgreement** - Track which agreements are signed
- **EmployeeDocument** - Uploaded files
- **Announcement** - Company announcements

## 🎨 Design System

The UI uses a custom design system built on Tailwind CSS:

- **Primary Color**: Nova Orange (`nova-500` to `nova-700`)
- **Neutral**: Stone grays for text and backgrounds
- **Status Colors**: Emerald (success), Amber (warning), Red (error)
- **Typography**: Outfit font for headings, system fonts for body

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run migrations (production) |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:studio` | Open Prisma Studio |

## 🚀 Deployment

### Production Considerations

1. **Environment Variables**: Ensure all env vars are set securely
2. **Database**: Use migrations (`npm run db:migrate`) instead of `db:push`
3. **JWT Secret**: Use a strong, randomly generated secret
4. **File Uploads**: Configure cloud storage (S3, Cloudinary) for document uploads
5. **Email**: Integrate email service for employee invitations

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## 🔮 Future Enhancements

- [ ] Email notifications for onboarding invites
- [ ] Password reset flow
- [ ] Real file upload to cloud storage
- [ ] PDF generation for signed agreements
- [ ] Payroll integration
- [ ] Time tracking
- [ ] Leave management
- [ ] Employee directory

## 📄 License

MIT License - feel free to use this for your own projects!

---

Built with ❤️ for Nova Creations

