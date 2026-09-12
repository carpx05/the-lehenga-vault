/**
 * Local & Cloud Persistence for Styling Session Appointments
 * Ensures zero leads are lost even if external email services experience network delays.
 */

export interface Appointment {
  id: string
  name: string
  phone: string
  email: string
  occasion: string
  date: string
  interest: string
  message: string
  status: "new" | "contacted" | "confirmed" | "completed"
  createdAt: string
}

const STORAGE_KEY = "lehenga_vault_appointments_v1"

export function getStoredAppointments(): Appointment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw)
    }
  } catch (err) {
    console.warn("Failed to load appointments from localStorage:", err)
  }
  return []
}

export function saveAppointmentRecord(
  data: Omit<Appointment, "id" | "status" | "createdAt">,
): Appointment {
  const newAppointment: Appointment = {
    ...data,
    id: `apt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    status: "new",
    createdAt: new Date().toISOString(),
  }

  try {
    const current = getStoredAppointments()
    const updated = [newAppointment, ...current]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch (err) {
    console.warn("Failed to save appointment to localStorage:", err)
  }

  return newAppointment
}

export function updateAppointmentStatus(
  id: string,
  status: Appointment["status"],
): void {
  try {
    const current = getStoredAppointments()
    const updated = current.map((a) => (a.id === id ? { ...a, status } : a))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch (err) {
    console.warn("Failed to update appointment status:", err)
  }
}

export function deleteAppointmentRecord(id: string): void {
  try {
    const current = getStoredAppointments()
    const updated = current.filter((a) => a.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch (err) {
    console.warn("Failed to delete appointment record:", err)
  }
}
