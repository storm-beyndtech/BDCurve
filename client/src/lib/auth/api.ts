// Simple: Just use the env variable
const API_URL = (import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000" : "")).replace(/\/$/, "");

interface LoginResponse {
	token: string;
	user: any;
}

interface RegisterResponse {
	token: string;
	user: any;
}

interface VerificationCodeResponse {
	message: string;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
	const res = await fetch(`${path}`, {
		...options,
		headers: {
			"Content-Type": "application/json",
			...(options.headers || {}),
		},
	});
	if (!res.ok) {
		const msg = await res.text();
		throw new Error(msg || res.statusText);
	}
	return res.json();
}

// Decode JWT to extract user ID (without verification)
function decodeToken(token: string): { _id: string } | null {
	try {
		const payload = token.split(".")[1];
		const decoded = JSON.parse(atob(payload));
		return decoded;
	} catch {
		return null;
	}
}

export const authApi = {
	login: (email: string, password: string) =>
		request<LoginResponse>(`${API_URL}${"/api/auth/login"}`, {
			method: "POST",
			body: JSON.stringify({ email, password }),
		}),
	register: (body: any) =>
		request<RegisterResponse>(`${API_URL}${"/api/auth/register"}`, {
			method: "POST",
			body: JSON.stringify(body),
		}),
	requestRegistrationCode: (email: string) =>
		request<VerificationCodeResponse>(`${API_URL}${"/api/auth/registration-code"}`, {
			method: "POST",
			body: JSON.stringify({ email }),
		}),
	verifyToken: async (token: string) => {
		// Decode token to get user ID
		const decoded = decodeToken(token);
		if (!decoded?._id) {
			throw new Error("Invalid token format");
		}

		// Fetch user with token in Authorization header
		const user = await request<{ user: any }>(`${API_URL}${"/api/auth/users/"}${decoded._id}`, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		return user;
	},
};
