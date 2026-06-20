import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const announcements = await db.announcement.findMany({
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({
      success: true,
      data: announcements,
    })
  } catch (error) {
    console.error('Announcements list error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch announcements' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, active, order } = body

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: message' },
        { status: 400 }
      )
    }

    const announcement = await db.announcement.create({
      data: {
        message,
        active: active !== undefined ? Boolean(active) : true,
        order: order !== undefined ? parseInt(String(order)) : 0,
      },
    })

    return NextResponse.json({
      success: true,
      data: announcement,
    })
  } catch (error) {
    console.error('Announcement create error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create announcement' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, message, active, order } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: id' },
        { status: 400 }
      )
    }

    const existingAnnouncement = await db.announcement.findUnique({ where: { id } })
    if (!existingAnnouncement) {
      return NextResponse.json(
        { success: false, error: 'Announcement not found' },
        { status: 404 }
      )
    }

    const updateData: Record<string, unknown> = {}
    if (message !== undefined) updateData.message = message
    if (active !== undefined) updateData.active = Boolean(active)
    if (order !== undefined) updateData.order = parseInt(String(order))

    const announcement = await db.announcement.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      data: announcement,
    })
  } catch (error) {
    console.error('Announcement update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update announcement' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: id' },
        { status: 400 }
      )
    }

    const existingAnnouncement = await db.announcement.findUnique({ where: { id } })
    if (!existingAnnouncement) {
      return NextResponse.json(
        { success: false, error: 'Announcement not found' },
        { status: 404 }
      )
    }

    await db.announcement.delete({ where: { id } })

    return NextResponse.json({
      success: true,
      data: { id },
    })
  } catch (error) {
    console.error('Announcement delete error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete announcement' },
      { status: 500 }
    )
  }
}
