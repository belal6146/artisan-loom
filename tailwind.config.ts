import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"index.html",
		"./src/**/*.{ts,tsx}",
		"./server/**/*.{ts,ts}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: {
				DEFAULT: "1rem",
				md: "1.5rem",
				xl: "2rem"
			},
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				brand: { 
					DEFAULT: 'hsl(220 83% 53%)', 
					foreground: 'hsl(210 20% 98%)' 
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
					warm: 'hsl(var(--accent-warm))',
					'warm-foreground': 'hsl(var(--accent-warm-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				}
			},
			borderRadius: {
				lg: 'var(--radius-lg)',
				md: 'var(--radius)',
				sm: 'var(--radius-sm)',
				xl: "1rem",
				'2xl': '1.25rem'
			},
			spacing: {
				'4': '1rem',
				'6': '1.5rem', 
				'8': '2rem',
				'12': '3rem',
				'16': '4rem',
				'18': '4.5rem',
				'88': '22rem',
				'128': '32rem'
			},
			boxShadow: {
				brand: '0 8px 24px hsl(220 50% 10% / 0.08)',
				card: "0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)",
				cardHover: "0 8px 20px rgba(0,0,0,.08)",
				'subtle': 'var(--shadow-subtle)',
				'soft': 'var(--shadow-soft)', 
				'medium': 'var(--shadow-medium)',
				'premium': 'var(--shadow-premium)'
			},
			backgroundImage: {
				'brand-radial': 'radial-gradient(1200px 600px at 10% -10%, hsl(220 90% 60% / .20), transparent)',
				'noise': 'url(/noise.png)',
				'gradient-brand': 'var(--gradient-brand)',
				'gradient-subtle': 'var(--gradient-subtle)'
			},
			fontFamily: {
				heading: 'var(--font-heading)',
				body: 'var(--font-body)'
			},
			transitionTimingFunction: {
				'smooth': 'var(--transition-smooth)',
				'spring': 'var(--transition-spring)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					from: { opacity: '0' },
					to: { opacity: '1' }
				},
				'slide-up': {
					from: { 
						opacity: '0',
						transform: 'translateY(20px)'
					},
					to: { 
						opacity: '1',
						transform: 'translateY(0)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'slide-up': 'slide-up 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
