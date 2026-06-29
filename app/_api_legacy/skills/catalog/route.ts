import { NextResponse } from 'next/server'
import catalogData from '@/data/skills-catalog.json'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const platform = searchParams.get('platform')
  const search = searchParams.get('search')?.toLowerCase()
  const featured = searchParams.get('featured') === 'true'

  let skills = catalogData.skills

  if (featured) {
    skills = skills.filter(s => s.featured)
  }

  if (category && category !== 'all') {
    skills = skills.filter(s => s.category.toLowerCase() === category.toLowerCase())
  }

  if (platform) {
    skills = skills.filter(s =>
      s.platforms.some(p => p.toLowerCase().includes(platform.toLowerCase()))
    )
  }

  if (search) {
    skills = skills.filter(s =>
      s.name.toLowerCase().includes(search) ||
      s.description.toLowerCase().includes(search) ||
      s.tagline.toLowerCase().includes(search)
    )
  }

  return NextResponse.json({
    skills,
    categories: catalogData.categories,
    total: skills.length,
  })
}
