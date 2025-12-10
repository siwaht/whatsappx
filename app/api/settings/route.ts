import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getEvolutionAPI, EvolutionAPIClient } from '@/lib/evolution-api';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user settings from DB
    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
      select: { evolutionApiUrl: true, evolutionApiKey: true, picaSecretKey: true }
    });

    const searchParams = request.nextUrl.searchParams;
    const instanceName = searchParams.get('instance');

    let instanceSettings = {};

    // If instance is selected, fetch its settings using the correct credentials
    if (instanceName) {
      try {
        // Use user credentials if available, otherwise fallback to env (handled by getEvolutionAPI default or we pass explicit nulls)
        // Actually, we should construct a new client if user has credentials
        let api;
        if (user?.evolutionApiUrl && user?.evolutionApiKey) {
          api = new EvolutionAPIClient(user.evolutionApiUrl, user.evolutionApiKey);
        } else {
          api = getEvolutionAPI();
        }

        instanceSettings = await api.getSettings(instanceName);
      } catch (e) {
        console.error("Failed to fetch instance settings", e);
        // Don't fail the whole request if just instance settings fail (e.g. if credentials are wrong)
      }
    }

    return NextResponse.json({
      ...instanceSettings,
      evolutionApiUrl: user?.evolutionApiUrl || '',
      evolutionApiKey: user?.evolutionApiKey || '',
      picaSecretKey: user?.picaSecretKey || ''
    });

  } catch (error: any) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      evolutionApiUrl,
      evolutionApiKey,
      instanceName,
      ...settings
    } = body;

    // Update User Settings if provided
    if (evolutionApiUrl !== undefined || evolutionApiKey !== undefined || body.picaSecretKey !== undefined) {
      const updateData: any = {};
      if (evolutionApiUrl !== undefined) updateData.evolutionApiUrl = evolutionApiUrl;
      if (evolutionApiKey !== undefined) updateData.evolutionApiKey = evolutionApiKey;
      if (body.picaSecretKey !== undefined) updateData.picaSecretKey = body.picaSecretKey;

      await prisma.user.update({
        where: { id: parseInt(session.user.id) },
        data: updateData
      });
    }

    // Update Instance Settings if instance provided
    if (instanceName) {
      // Fetch fresh user data to ensure we have the latest credentials (including what we just saved)
      const user = await prisma.user.findUnique({
        where: { id: parseInt(session.user.id) },
        select: { evolutionApiUrl: true, evolutionApiKey: true }
      });

      let api;
      if (user?.evolutionApiUrl && user?.evolutionApiKey) {
        api = new EvolutionAPIClient(user.evolutionApiUrl, user.evolutionApiKey);
      } else {
        api = getEvolutionAPI();
      }

      await api.setSettings(instanceName, settings);
    }

    return NextResponse.json({ message: 'Settings updated successfully' });
  } catch (error: any) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update settings' },
      { status: 500 }
    );
  }
}
