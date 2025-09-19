"use client"

import * as React from "react"
import {
  BookOpen,
  Bot,
  Command,
  Frame,
  Heart,
  LifeBuoy,
  Map,
  MessageCircle,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
} from "lucide-react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/auth-context"
import { providerApi } from "@/lib/providers"
import { t } from "@/lib/translations"
import { useDeviceDetection } from "@/lib/device-detection"

const data = {
  navMain: [
    {
      title: "Playground",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "History",
          url: "#",
        },
        {
          title: "Starred",
          url: "#",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
    {
      title: "Models",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Genesis",
          url: "#",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
}

// Custom Menu Item component that handles mobile sidebar closing
function SidebarMenuItemWithAutoClose({ href, children, ...props }: { href: string; children: React.ReactNode }) {
  const { isMobile } = useDeviceDetection()
  const { setOpenMobile } = useSidebar()

  const handleClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <SidebarMenuItem {...props}>
      <SidebarMenuButton asChild>
        <Link href={href} onClick={handleClick}>
          {children}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()
  const fullName = (user?.user_metadata as any)?.full_name || user?.email || "User"
  const email = user?.email || ""
  const avatar = (user?.user_metadata as any)?.avatar_url || "/vercel.svg"
  const pathname = usePathname()

  const isProviderArea = pathname?.startsWith('/provider/')
  const [businessType, setBusinessType] = React.useState<string | null>(null)

  React.useEffect(() => {
    const load = async () => {
      if (!user?.id) return
      try {
        const provider = await providerApi.getProviderByUserId(user.id)
        setBusinessType(provider?.businessType || null)
      } catch {}
    }
    if (isProviderArea) load()
  }, [user?.id, isProviderArea])

  const servicesLabel = (() => {
    switch (businessType) {
      case 'grooming': return 'Gyvūnų šukavimo paslaugos'
      case 'training': return 'Gyvūnų treniruočių paslaugos'
      case 'veterinary': return t('serviceCategories.veterinary')
      case 'boarding': return 'Prieglaudos paslaugos'
      case 'adoption': return t('serviceCategories.adoption')
      case 'sitting': return 'Gyvūnų prižiūrėjimo paslaugos'
      default: return t('navigation.services')
    }
  })()

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{fullName}</span>
                  <span className="truncate text-xs">{email}</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {isProviderArea ? (
            <>
              <SidebarMenuItemWithAutoClose href="/provider/dashboard">
                <SquareTerminal />
                <span>{t('navigation.dashboard')}</span>
              </SidebarMenuItemWithAutoClose>
              <SidebarMenuItemWithAutoClose href="/provider/dashboard/bookings">
                <Bot />
                <span>{t('navigation.bookings')}</span>
              </SidebarMenuItemWithAutoClose>
              <SidebarMenuItemWithAutoClose href="/provider/dashboard/chat">
                <MessageCircle />
                <span>Customer Messages</span>
              </SidebarMenuItemWithAutoClose>
              <SidebarMenuItemWithAutoClose href="/provider/dashboard/services">
                <BookOpen />
                <span>{servicesLabel}</span>
              </SidebarMenuItemWithAutoClose>
              <SidebarMenuItemWithAutoClose href="/provider/dashboard/pet-ads">
                <Heart />
                <span>Gyvūnų adopcija</span>
              </SidebarMenuItemWithAutoClose>
              <SidebarMenuItemWithAutoClose href="/provider/dashboard/calendar">
                <BookOpen />
                <span>{t('navigation.calendar')}</span>
              </SidebarMenuItemWithAutoClose>
              <SidebarMenuItemWithAutoClose href="/provider/dashboard/analytics">
                <PieChart />
                <span>{t('providerDashboard.analytics')}</span>
              </SidebarMenuItemWithAutoClose>
              <SidebarMenuItemWithAutoClose href="/provider/dashboard/settings">
                <Settings2 />
                <span>{t('navigation.settings', 'Nustatymai')}</span>
              </SidebarMenuItemWithAutoClose>
              <SidebarMenuItemWithAutoClose href="/provider/dashboard/profile">
                <Settings2 />
                <span>{t('navigation.profile')}</span>
              </SidebarMenuItemWithAutoClose>
            </>
          ) : (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin">
                    <SquareTerminal />
                    <span>Overview</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin/users">
                    <Bot />
                    <span>Users</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin/providers">
                    <BookOpen />
                    <span>Providers</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin/listings">
                    <Settings2 />
                    <span>Listings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin/analytics">
                    <PieChart />
                    <span>Analytics</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          )}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{ name: fullName, email, avatar }} />
      </SidebarFooter>
    </Sidebar>
  )
}
