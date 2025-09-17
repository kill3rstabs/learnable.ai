import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          glow: "hsl(var(--primary-glow))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        "gradient-primary": "var(--gradient-primary)",
        "gradient-hero": "var(--gradient-hero)",
        "gradient-card": "var(--gradient-card)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        elevated: "var(--shadow-elevated)",
      },
      keyframes: {
		labelOrbit: {
			/* Start at normal position */
			"0%": {
			  transform: "translateY(0%)",
			  animationTimingFunction: "cubic-bezier(0.55, 0.06, 0.68, 0.19)" /* fast-up (ease-in-ish) */,
			},
			/* Fast slide up to hide the first line */
			"30%": {
			  transform: "translateY(-100%)",
			  animationTimingFunction: "steps(1, end)" /* snap/tp for the wrap */,
			},
			/* Instantly place below the view to simulate circular path */
			"31%": {
			  transform: "translateY(100%)",
			  animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" /* slow, luxurious return */,
			},
			/* Slow rise from bottom back to original */
			"100%": {
			  transform: "translateY(0%)",
			},
		  },
		labelTicker: {
			"0%, 20%": { transform: "translateY(0%)" },       // pause at start
			"45%": { transform: "translateY(-100%)" },        // slide up
			"55%": { transform: "translateY(100%)" },         // jump below
			"80%, 100%": { transform: "translateY(0%)" },     // slide back & pause
		  },
		// labelSlideUp: {
		// 	"0%":   { transform: "translateY(0%)" },
		// 	"100%": { transform: "translateY(-100%)" },
		// },
		// labelTickerOnce: {
		// 	"0%":   { transform: "translateY(0%)" },
		// 	"100%": { transform: "translateY(-100%)" },
		//   },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-glow": {
          "0%, 100%": {
            boxShadow: "0 0 20px hsl(var(--primary) / 0.3)",
          },
          "50%": {
            boxShadow: "0 0 40px hsl(var(--primary) / 0.6)",
          },
        },
        // NEW: gentle "going & coming" animation for the CTA button
        pulseButton: {
          "0%, 100%": { transform: "scale(1) translateY(0)" },
          "50%": { transform: "scale(1.07) translateY(-1px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
		labelOrbit: "labelOrbit 2.2s linear infinite",
		labelTicker: "labelTicker 1.5s ease-in-out infinite",
		// labelSlideUp: "labelSlideUp 0.35s ease-out forwards",
		// labelTickerOnce: "labelTickerOnce 300ms ease-out forwards",
        "accordion-up": "accordion-up 0.2s ease-out",
        float: "float 3s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        // NEW
        pulseButton: "pulseButton 2.5s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
