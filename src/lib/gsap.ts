import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"

// Register GSAP plugins safely in browser
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP)
}

export { gsap, ScrollTrigger, useGSAP }

/**
 * Checks whether user has enabled reduced motion in OS/browser.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

/**
 * Helper to animate elements with a subtle, luxury fade-up on scroll.
 */
export function initFadeUp(
  target: gsap.DOMTarget,
  options?: {
    trigger?: gsap.DOMTarget
    y?: number
    duration?: number
    stagger?: number
    start?: string
    delay?: number
  },
) {
  if (prefersReducedMotion()) return

  return gsap.from(target, {
    scrollTrigger: {
      trigger: options?.trigger || target as any,
      start: options?.start || "top 85%",
      toggleActions: "play none none none",
      once: true,
    },
    y: options?.y ?? 30,
    opacity: 0,
    duration: options?.duration ?? 0.85,
    delay: options?.delay ?? 0,
    stagger: options?.stagger ?? 0.1,
    ease: "power2.out",
  })
}

/**
 * Subtle parallax effect for images or background containers.
 */
export function initParallax(
  target: gsap.DOMTarget,
  options?: {
    trigger?: gsap.DOMTarget
    yPercent?: number
  },
) {
  if (prefersReducedMotion()) return

  return gsap.to(target, {
    scrollTrigger: {
      trigger: options?.trigger || target as any,
      start: "top bottom",
      end: "bottom top",
      scrub: 1.2,
    },
    yPercent: options?.yPercent ?? 10,
    ease: "none",
  })
}
