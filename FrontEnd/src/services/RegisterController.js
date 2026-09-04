import { API_BASE_URL } from '../api';

export const registerUser = async (userData, step) => {
    try {
        if (step === 1) {
            const userPayload = {
                first_name: userData.first_name,
                last_name: userData.last_name,
                email: userData.email,
                password: userData.password,
                phone_number: userData.phone_number,
                date_of_birth: userData.date_of_birth,
                is_verified: 1,
                role: userData.role
            };

            const userRes = await fetch(`${API_BASE_URL}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userPayload)
            });

            if (!userRes.ok) throw new Error('Failed to register user');
            const { user_id } = await userRes.json();
            return { user_id };
        }

        if (step === 2) {
            const profilePayload = {
                user_id: userData.user_id,
                bio: userData.bio,
                skills: userData.skills,
                experience: userData.experience,
                location: userData.location,
                education: userData.education,
                certifications: userData.certifications,
                languages: userData.languages,
                cv: userData.cv,
                social_links: userData.social_links,
                website: userData.website
            };

            const profileRes = await fetch(`${API_BASE_URL}/profiles`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profilePayload)
            });
            console.log('Profile response:', profilePayload);
            if (!profileRes.ok) throw new Error('Failed to create profile');
            return { success: true };
        }

        if (step === 3 && userData.role === 'employer') {
            const companyPayload = {
                company_name: userData.company_name,
                industry: userData.industry,
                founded_year: userData.founded_year,
                location: userData.company_location,
                description: userData.description
            };
            const companyRes = await fetch(`${API_BASE_URL}/companies`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(companyPayload)
            });
            if (!companyRes.ok) {
                throw new Error('Failed to create company');
            }
            const { companyId } = await companyRes.json();
            console.log('Company created with ID:', companyId);
            localStorage.setItem('companyId', companyId);
            return { success: true };
        }

        if (step === 4 && userData.role === 'employer') {
            console.log('📌 Step 4 reached, user is employer');

            const companyId = localStorage.getItem('companyId');
            console.log('🏢 Retrieved companyId from localStorage:', companyId);

            if (!companyId) {
                console.error('❌ Missing companyId in localStorage');
                throw new Error('Company ID not found in localStorage');
            }

            console.log('👤 userData:', userData);

            const jobPayload = {
                title: userData.title,
                description: userData.description,
                location: userData.location,
                skills_required: userData.skills_required,
                salary: userData.salary,
                job_type: userData.job_type,
                remote_option: userData.remote_option,
                category: userData.category,
                company_id: companyId
            };

            console.log('🚀 Job payload to send:', jobPayload);

            const jobRes = await fetch(`${API_BASE_URL}/jobs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(jobPayload)
            });

            console.log('📡 Sent POST to /jobs. Response status:', jobRes.status);

            const resData = await jobRes.json().catch(() => null);
            console.log('📥 Response body:', resData);

            if (!jobRes.ok) {
                console.error('❌ Failed to create job. Server response:', resData);
                throw new Error('Failed to create job');
            }

            console.log('✅ Job created successfully with response:', resData);
            return { success: true };
        }
    } catch (err) {
        console.error('Registration error:', err);
        throw err;
    }
};
