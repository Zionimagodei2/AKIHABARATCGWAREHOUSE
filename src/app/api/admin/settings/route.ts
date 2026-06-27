import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const settings = await db.siteSetting.findMany()
    // Convert array to key-value object for easier consumption
    const settingsMap: Record<string, string> = {}
    for (const setting of settings) {
      settingsMap[setting.key] = setting.value
    }

    return NextResponse.json(settingsMap)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()

    if (typeof body !== 'object' || body === null) {
      return NextResponse.json(
        { error: 'Request body must be an object with key-value pairs' },
        { status: 400 }
      )
    }

    // Upsert each setting
    const results = []
    for (const [key, value] of Object.entries(body)) {
      if (typeof key !== 'string' || typeof value !== 'string') {
        continue
      }
      const setting = await db.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
      results.push(setting)
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
