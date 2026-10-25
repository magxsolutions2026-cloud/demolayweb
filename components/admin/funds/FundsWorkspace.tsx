'use client';

import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Download,
  HandCoins,
  LayoutDashboard,
  Megaphone,
  Pencil,
  PiggyBank,
  Plus,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import NewsImageGallery from '@/components/site/NewsImageGallery';
import { cleanCampaignImageUrls, MAX_CAMPAIGN_IMAGES, parseCampaignImageUrls } from '@/lib/campaignImages';
import { formatCurrency } from '@/lib/formatCurrency';
import { formatRelativeTime } from '@/lib/formatRelativeTime';
import { AdminGhostButton, AdminPrimaryButton } from '@/components/admin/AdminButtons';
import { ConfirmModal } from '@/components/admin/ConfirmModal';
import { DashboardModal } from '@/components/admin/DashboardModal';
import { AdminField, adminInputClass } from '@/components/admin/AdminFormFields';
import { AdminBrandMark } from '@/components/admin/AdminBrandMark';
import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { AdminPagination } from '@/components/admin/AdminPagination';
import type { MonthlyPoint, TypeSlice, CategorySlice } from '@/components/admin/funds/FundsCharts';
import { useCountUp } from '@/components/admin/funds/useCountUp';

const FundsCharts = dynamic(
  () => import('@/components/admin/funds/FundsCharts').then((m) => m.FundsCharts),
  {
    ssr: false,
    loading: () => (
      <div className="border-gold/15 bg-white/[0.03] h-96 animate-pulse rounded-2xl border" />
    ),
  },
);

type ToastFn = (type: 'success' | 'error', message: string) => void;

type FundSourceRow = {
  id: number;
  title: string;
  amount: number | string;
  source_type: string;
  /** Shown when `source_type` is `other`. */
  source_specify?: string | null;
  source_date: string;
  description: string | null;
  campaign_id: number | null;
  campaign_name?: string | null;
};

type DisbursementRow = {
  id: number;
  title: string;
  amount: number | string;
  category: string;
  disbursement_date: string;
  purpose: string | null;
};

type CampaignRow = {
  id: number;
  name: string;
  slug?: string | null;
  goal_amount: number | string;
  start_date: string;
  end_date: string;
  status: string;
  campaign_type?: string;
  summary?: string | null;
  description?: string | null;
  cover_image_url?: string | null;
  image_urls?: string[];
  unit_price?: number | string | null;
  size_options?: string[];
  raised?: number | string;
  order_count?: number | string;
  shirts_sold?: number | string;
};

type CampaignOrderRow = {
  id: number;
  campaign_id?: number;
  campaign_name?: string;
  campaign_slug?: string | null;
  brother_name: string;
  email: string;
  phone?: string | null;
  shirt_size: string;
  quantity: number | string;
  unit_price: number | string;
  total_amount: number | string;
  notes?: string | null;
  created_at: string;
};

type OrderSummary = {
  totalOrders: number;
  totalShirts: number;
  totalCollected: number;
  sizeBreakdown: Array<{ size: string; quantity: number }>;
};

type ActivityRow = { id: number; action_type: string; message: string; created_at: string };

type FundsSummary = {
  balance: number;
  totalRaised: number;
  totalDisbursed: number;
  activeCampaigns: number;
  monthlySeries: MonthlyPoint[];
  sourcesByType: TypeSlice[];
  disbursementsByCategory: CategorySlice[];
  activity: ActivityRow[];
};

const PAGE = 8;
const TABS = [
  { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'sources' as const, label: 'Fund sources', icon: PiggyBank },
  { id: 'disbursements' as const, label: 'Disbursements', icon: ArrowDownRight },
  { id: 'campaigns' as const, label: 'Campaigns', icon: Megaphone },
  { id: 'orders' as const, label: 'T-shirt orders', icon: HandCoins },
  { id: 'reports' as const, label: 'Reports', icon: BarChart3 },
];

export type FundsTabId = (typeof TABS)[number]['id'];

const SOURCE_OPTIONS = [
  { value: 'donations', label: 'Donations' },
  { value: 'events', label: 'Events' },
  { value: 'contributions', label: 'Contributions' },
  { value: 'sponsors', label: 'Sponsors' },
  { value: 'other', label: 'Other' },
];

function num(v: unknown): number {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? ''));
  return Number.isFinite(n) ? n : 0;
}

function categoryBorder(cat: string): string {
  const c = cat.toLowerCase();
  if (c.includes('event')) return 'border-l-emerald-400/90';
  if (c.includes('charity') || c.includes('help')) return 'border-l-sky-400/90';
  if (c.includes('supplies') || c.includes('material')) return 'border-l-amber-400/90';
  if (c.includes('travel') || c.includes('transport')) return 'border-l-violet-400/90';
  return 'border-l-gold/70';
}

const SOURCE_TYPE_LABEL: Record<string, string> = {
  donations: 'Donations',
  events: 'Events',
  contributions: 'Contributions',
  sponsors: 'Sponsors',
  other: 'Other',
};

function fundSourceTypeLabel(row: FundSourceRow): string {
  if (row.source_type === 'other' && row.source_specify?.trim()) {
    return `Other — ${row.source_specify.trim()}`;
  }
  return SOURCE_TYPE_LABEL[row.source_type] || row.source_type;
}

const DEFAULT_TSHIRT_SIZES = ['S', 'M', 'L', 'XL'];
const ORDER_PDF_HEADER_TITLE = 'T. Deleon Chapter Order of Demolay';
const ORDER_PDF_HEADER_SPONSOR = 'Sponsored By : Isabela Masonic Lodge No. 60 Of free And Accepted Mason';
const ORDER_PDF_SPONSOR_LOGO_SRC = '/isabela-masonic-lodge-60-logo.jpg';

function sortShirtSizes(a: string, b: string): number {
  const order = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];
  const ai = order.indexOf(a);
  const bi = order.indexOf(b);
  if (ai !== -1 || bi !== -1) {
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  }
  return a.localeCompare(b);
}

function downloadBlob(blob: Blob, filename: string) {
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(href);
}

function toFileSlug(value: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'tshirt-orders';
}

function readBlobAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Could not read image data.'));
    reader.readAsDataURL(blob);
  });
}

async function fetchAsDataUrl(src: string): Promise<string | null> {
  try {
    const response = await fetch(src, { cache: 'force-cache' });
    if (!response.ok) return null;
    return await readBlobAsDataUrl(await response.blob());
  } catch {
    return null;
  }
}

async function loadFirstAvailableImage(candidates: Array<string | null | undefined>): Promise<string | null> {
  for (const candidate of candidates) {
    if (!candidate?.trim()) continue;
    const dataUrl = await fetchAsDataUrl(candidate);
    if (dataUrl) return dataUrl;
  }
  return null;
}

function detectPdfImageFormat(dataUrl: string): 'PNG' | 'JPEG' {
  return dataUrl.startsWith('data:image/png') ? 'PNG' : 'JPEG';
}

function formatPdfMoney(amount: number): string {
  return `PHP ${amount.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function FundsWorkspace({
  toast,
  chapterName,
  logoUrl,
  activeTab,
  onTabChange,
  refreshSignal = 0,
}: {
  toast: ToastFn;
  chapterName?: string | null;
  logoUrl?: string | null;
  activeTab?: FundsTabId;
  onTabChange?: (tab: FundsTabId) => void;
  refreshSignal?: number;
}) {
  const [internalTab, setInternalTab] = useState<FundsTabId>('dashboard');
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState('');
  const hasMountedRefreshSignal = useRef(false);

  const tab = activeTab ?? internalTab;
  const setTab = useCallback(
    (nextTab: FundsTabId) => {
      if (activeTab === undefined) {
        setInternalTab(nextTab);
      }
      onTabChange?.(nextTab);
    },
    [activeTab, onTabChange],
  );

  const [summary, setSummary] = useState<FundsSummary | null>(null);
  const [sources, setSources] = useState<FundSourceRow[]>([]);
  const [disbursements, setDisbursements] = useState<DisbursementRow[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [orders, setOrders] = useState<CampaignOrderRow[]>([]);
  const [ordersOverview, setOrdersOverview] = useState<OrderSummary>({
    totalOrders: 0,
    totalShirts: 0,
    totalCollected: 0,
    sizeBreakdown: [],
  });

  const [srcSearch, setSrcSearch] = useState('');
  const [srcSort, setSrcSort] = useState<'date' | 'amount'>('date');
  const [srcOrder, setSrcOrder] = useState<'asc' | 'desc'>('desc');
  const [srcPage, setSrcPage] = useState(1);

  const [disSearch, setDisSearch] = useState('');
  const [disSort, setDisSort] = useState<'date' | 'amount'>('date');
  const [disOrder, setDisOrder] = useState<'asc' | 'desc'>('desc');
  const [disPage, setDisPage] = useState(1);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderCampaign, setOrderCampaign] = useState<string>('all');
  const [orderPage, setOrderPage] = useState(1);
  const [orderPdfLoading, setOrderPdfLoading] = useState(false);

  const [sourceModal, setSourceModal] = useState(false);
  const [sourceEdit, setSourceEdit] = useState<FundSourceRow | null>(null);
  const [disModal, setDisModal] = useState(false);
  const [disEdit, setDisEdit] = useState<DisbursementRow | null>(null);
  const [campModal, setCampModal] = useState(false);
  const [campEdit, setCampEdit] = useState<CampaignRow | null>(null);
  const [campDetail, setCampDetail] = useState<CampaignRow | null>(null);
  const [campDetailRows, setCampDetailRows] = useState<FundSourceRow[]>([]);
  const [campDetailOrders, setCampDetailOrders] = useState<CampaignOrderRow[]>([]);
  const [campDetailOrderSummary, setCampDetailOrderSummary] = useState<OrderSummary>({
    totalOrders: 0,
    totalShirts: 0,
    totalCollected: 0,
    sizeBreakdown: [],
  });
  const [campDetailLoading, setCampDetailLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<
    { kind: 'source' | 'dis' | 'camp'; id: number; title: string } | null
  >(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    setLoadErr('');
    try {
      const [sRes, srcRes, dRes, cRes, oRes] = await Promise.all([
        fetch('/api/admin/funds/summary', { credentials: 'include' }),
        fetch('/api/admin/funds/sources', { credentials: 'include' }),
        fetch('/api/admin/funds/disbursements', { credentials: 'include' }),
        fetch('/api/admin/funds/campaigns', { credentials: 'include' }),
        fetch('/api/admin/funds/orders', { credentials: 'include' }),
      ]);
      if (!sRes.ok) {
        const j = await sRes.json().catch(() => ({}));
        throw new Error(j.error || `Summary ${sRes.status}`);
      }
      if (!srcRes.ok || !dRes.ok || !cRes.ok || !oRes.ok) throw new Error('Could not load funds data');

      const sJson = await sRes.json();
      const srcJson = await srcRes.json();
      const dJson = await dRes.json();
      const cJson = await cRes.json();
      const oJson = await oRes.json();

      setSummary({
        balance: num(sJson.balance),
        totalRaised: num(sJson.totalRaised),
        totalDisbursed: num(sJson.totalDisbursed),
        activeCampaigns: num(sJson.activeCampaigns),
        monthlySeries: sJson.monthlySeries || [],
        sourcesByType: sJson.sourcesByType || [],
        disbursementsByCategory: sJson.disbursementsByCategory || [],
        activity: sJson.activity || [],
      });
      setSources(srcJson.sources || []);
      setDisbursements(dJson.disbursements || []);
      setCampaigns(cJson.campaigns || []);
      setOrders(oJson.orders || []);
      setOrdersOverview({
        totalOrders: num(oJson.summary?.totalOrders),
        totalShirts: num(oJson.summary?.totalShirts),
        totalCollected: num(oJson.summary?.totalCollected),
        sizeBreakdown: Array.isArray(oJson.summary?.sizeBreakdown)
          ? oJson.summary.sizeBreakdown.map((row: { size: string; quantity: number | string }) => ({
              size: String(row.size ?? ''),
              quantity: num(row.quantity),
            }))
          : [],
      });
    } catch (e) {
      setLoadErr(e instanceof Error ? e.message : 'Failed to load funds');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!hasMountedRefreshSignal.current) {
      hasMountedRefreshSignal.current = true;
      return;
    }
    void refresh();
  }, [refreshSignal, refresh]);

  const balanceAnim = useCountUp(summary?.balance ?? 0);
  const raisedAnim = useCountUp(summary?.totalRaised ?? 0);
  const disbAnim = useCountUp(summary?.totalDisbursed ?? 0);
  const campAnim = useCountUp(summary?.activeCampaigns ?? 0);

  const filteredSources = useMemo(() => {
    const q = srcSearch.trim().toLowerCase();
    let rows = [...sources];
    if (q) {
      rows = rows.filter((r) => {
        const spec = String(r.source_specify || '').toLowerCase();
        return (
          String(r.title).toLowerCase().includes(q) ||
          String(r.description || '').toLowerCase().includes(q) ||
          spec.includes(q)
        );
      });
    }
    rows.sort((a, b) => {
      if (srcSort === 'amount') {
        const d = num(a.amount) - num(b.amount);
        return srcOrder === 'asc' ? d : -d;
      }
      const ta = new Date(a.source_date).getTime();
      const tb = new Date(b.source_date).getTime();
      const d = ta - tb;
      return srcOrder === 'asc' ? d : -d;
    });
    return rows;
  }, [sources, srcSearch, srcSort, srcOrder]);

  const srcPages = Math.max(1, Math.ceil(filteredSources.length / PAGE));
  const srcSlice = filteredSources.slice((srcPage - 1) * PAGE, srcPage * PAGE);

  const filteredDis = useMemo(() => {
    const q = disSearch.trim().toLowerCase();
    let rows = [...disbursements];
    if (q) {
      rows = rows.filter(
        (r) =>
          String(r.title).toLowerCase().includes(q) ||
          String(r.purpose || '').toLowerCase().includes(q) ||
          String(r.category).toLowerCase().includes(q),
      );
    }
    rows.sort((a, b) => {
      if (disSort === 'amount') {
        const d = num(a.amount) - num(b.amount);
        return disOrder === 'asc' ? d : -d;
      }
      const ta = new Date(a.disbursement_date).getTime();
      const tb = new Date(b.disbursement_date).getTime();
      const d = ta - tb;
      return disOrder === 'asc' ? d : -d;
    });
    return rows;
  }, [disbursements, disSearch, disSort, disOrder]);

  const disPages = Math.max(1, Math.ceil(filteredDis.length / PAGE));
  const disSlice = filteredDis.slice((disPage - 1) * PAGE, disPage * PAGE);

  const filteredOrders = useMemo(() => {
    const q = orderSearch.trim().toLowerCase();
    let rows = [...orders];
    if (orderCampaign !== 'all') {
      rows = rows.filter((row) => String(row.campaign_id) === orderCampaign);
    }
    if (q) {
      rows = rows.filter((row) =>
        [
          row.brother_name,
          row.email,
          row.phone || '',
          row.shirt_size,
          row.campaign_name,
          row.notes || '',
        ].some((value) => String(value).toLowerCase().includes(q)),
      );
    }
    rows.sort((a, b) => {
      const ta = new Date(a.created_at).getTime();
      const tb = new Date(b.created_at).getTime();
      return tb - ta;
    });
    return rows;
  }, [orders, orderCampaign, orderSearch]);

  const orderPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE));
  const orderSlice = filteredOrders.slice((orderPage - 1) * PAGE, orderPage * PAGE);

  const filteredOrderSummary = useMemo<OrderSummary>(() => {
    const totals = filteredOrders.reduce(
      (acc, row) => {
        acc.totalOrders += 1;
        acc.totalShirts += num(row.quantity);
        acc.totalCollected += num(row.total_amount);
        acc.sizeBreakdown.set(row.shirt_size, (acc.sizeBreakdown.get(row.shirt_size) ?? 0) + num(row.quantity));
        return acc;
      },
      {
        totalOrders: 0,
        totalShirts: 0,
        totalCollected: 0,
        sizeBreakdown: new Map<string, number>(),
      },
    );

    return {
      totalOrders: totals.totalOrders,
      totalShirts: totals.totalShirts,
      totalCollected: totals.totalCollected,
      sizeBreakdown: [...totals.sizeBreakdown.entries()]
        .map(([size, quantity]) => ({ size, quantity }))
        .sort((a, b) => sortShirtSizes(a.size, b.size)),
    };
  }, [filteredOrders]);

  useEffect(() => {
    setSrcPage(1);
  }, [srcSearch, srcSort, srcOrder]);
  useEffect(() => {
    setDisPage(1);
  }, [disSearch, disSort, disOrder]);
  useEffect(() => {
    setOrderPage(1);
  }, [orderCampaign, orderSearch]);

  const openCampDetail = async (c: CampaignRow) => {
    setCampDetail(c);
    setCampDetailLoading(true);
    setCampDetailRows([]);
    setCampDetailOrders([]);
    setCampDetailOrderSummary({
      totalOrders: 0,
      totalShirts: 0,
      totalCollected: 0,
      sizeBreakdown: [],
    });
    try {
      const r = await fetch(`/api/admin/funds/campaigns/${c.id}`, { credentials: 'include' });
      if (!r.ok) throw new Error('Failed');
      const j = await r.json();
      setCampDetail(j.campaign as CampaignRow);
      setCampDetailRows((j.contributions || []) as FundSourceRow[]);
      setCampDetailOrders((j.orders || []) as CampaignOrderRow[]);
      setCampDetailOrderSummary({
        totalOrders: num(j.orderSummary?.totalOrders),
        totalShirts: num(j.orderSummary?.totalShirts),
        totalCollected: num(j.orderSummary?.totalAmount),
        sizeBreakdown: Array.isArray(j.orderSummary?.sizeBreakdown)
          ? j.orderSummary.sizeBreakdown
              .map((row: { size: string; quantity: number | string }) => ({
                size: String(row.size ?? ''),
                quantity: num(row.quantity),
              }))
              .sort((a: { size: string }, b: { size: string }) => sortShirtSizes(a.size, b.size))
          : [],
      });
    } catch {
      toast('error', 'Could not load campaign details.');
    } finally {
      setCampDetailLoading(false);
    }
  };

  const runDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      let path = '';
      if (deleteTarget.kind === 'source') path = `/api/admin/funds/sources/${deleteTarget.id}`;
      if (deleteTarget.kind === 'dis') path = `/api/admin/funds/disbursements/${deleteTarget.id}`;
      if (deleteTarget.kind === 'camp') path = `/api/admin/funds/campaigns/${deleteTarget.id}`;
      const r = await fetch(path, { method: 'DELETE', credentials: 'include' });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.error || 'Delete failed');
      }
      setDeleteTarget(null);
      if (deleteTarget.kind === 'camp') {
        setCampDetail(null);
        setCampDetailRows([]);
        setCampDetailOrders([]);
      }
      await refresh();
      toast('success', 'Deleted.');
    } catch (error) {
      toast('error', error instanceof Error ? error.message : 'Could not delete.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const downloadCsv = () => {
    if (!summary) return;
    const lines: string[] = [];
    lines.push('Chapter Funds Report');
    lines.push(`Generated,${new Date().toISOString()}`);
    lines.push(`Balance,${summary.balance}`);
    lines.push(`Total raised,${summary.totalRaised}`);
    lines.push(`Total disbursements,${summary.totalDisbursed}`);
    lines.push('');
    lines.push('Month,Raised,Disbursed');
    summary.monthlySeries.forEach((m) => {
      lines.push(`${m.month},${m.raised},${m.disbursed}`);
    });
    lines.push('');
    lines.push('Fund sources (title,amount,type,date)');
    sources.forEach((s) => {
      lines.push(`${JSON.stringify(s.title)},${num(s.amount)},${s.source_type},${s.source_date}`);
    });
    lines.push('');
    lines.push('Disbursements (title,amount,category,date)');
    disbursements.forEach((d) => {
      lines.push(`${JSON.stringify(d.title)},${num(d.amount)},${d.category},${d.disbursement_date}`);
    });
    lines.push('');
    lines.push('T-shirt orders (campaign,brother,email,size,quantity,total,created_at)');
    orders.forEach((order) => {
      lines.push(
        `${JSON.stringify(order.campaign_name)},${JSON.stringify(order.brother_name)},${order.email},${order.shirt_size},${num(order.quantity)},${num(order.total_amount)},${order.created_at}`,
      );
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    downloadBlob(blob, `chapter-funds-${new Date().toISOString().slice(0, 10)}.csv`);
    toast('success', 'CSV downloaded.');
  };

  const downloadOrderPdf = async () => {
    if (filteredOrders.length === 0) {
      toast('error', 'No T-shirt orders to export.');
      return;
    }

    setOrderPdfLoading(true);
    try {
      const [{ jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
      const generatedAt = new Date();
      const selectedCampaign =
        orderCampaign === 'all' ? null : campaigns.find((campaign) => String(campaign.id) === orderCampaign) || null;
      const chapterLabel = chapterName?.trim() || 'T. De Leon Chapter No. 47';

      const [chapterLogoDataUrl, sponsorLogoDataUrl] = await Promise.all([
        loadFirstAvailableImage([logoUrl, '/logo.png']),
        loadFirstAvailableImage([ORDER_PDF_SPONSOR_LOGO_SRC]),
      ]);

      const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const marginX = 42;
      const reportWidth = 474;
      const reportX = (pageWidth - reportWidth) / 2;
      const pdfColors = {
        black: [20, 20, 20] as const,
        dark: [70, 70, 70] as const,
        line: [145, 145, 145] as const,
        soft: [242, 242, 242] as const,
        white: [255, 255, 255] as const,
      };
      const drawContainedImage = (dataUrl: string | null, x: number, y: number, boxWidth: number, boxHeight: number) => {
        if (!dataUrl) return;
        const props = doc.getImageProperties(dataUrl);
        const scale = Math.min(boxWidth / props.width, boxHeight / props.height);
        const width = props.width * scale;
        const height = props.height * scale;
        const imageX = x + (boxWidth - width) / 2;
        const imageY = y + (boxHeight - height) / 2;
        doc.addImage(dataUrl, detectPdfImageFormat(dataUrl), imageX, imageY, width, height);
      };

      const drawHeader = () => {
        doc.setFillColor(...pdfColors.white);
        doc.rect(reportX, 34, reportWidth, 80, 'F');
        doc.setDrawColor(...pdfColors.black);
        doc.setLineWidth(1);
        doc.rect(reportX, 34, reportWidth, 80, 'S');
        doc.setDrawColor(...pdfColors.line);
        doc.line(reportX + 70, 94, reportX + reportWidth - 70, 94);

        const logoBoxSize = 42;
        const logoBoxY = 53;
        const leftLogoBoxX = reportX + 14;
        const rightLogoBoxX = reportX + reportWidth - 14 - logoBoxSize;

        drawContainedImage(chapterLogoDataUrl, leftLogoBoxX, logoBoxY, logoBoxSize, logoBoxSize);
        drawContainedImage(sponsorLogoDataUrl, rightLogoBoxX, logoBoxY, logoBoxSize, logoBoxSize);

        doc.setFont('times', 'bold');
        doc.setFontSize(15);
        doc.setTextColor(...pdfColors.black);
        doc.text(ORDER_PDF_HEADER_TITLE, pageWidth / 2, 58, { align: 'center' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(...pdfColors.dark);
        doc.text(doc.splitTextToSize(ORDER_PDF_HEADER_SPONSOR, reportWidth - 120), pageWidth / 2, 74, {
          align: 'center',
        });

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.8);
        doc.setTextColor(...pdfColors.black);
        doc.text('T-SHIRT ORDER LIST', pageWidth / 2, 106, { align: 'center' });
      };

      const drawFooter = (pageNumber: number) => {
        doc.setDrawColor(...pdfColors.line);
        doc.line(marginX, pageHeight - 34, pageWidth - marginX, pageHeight - 34);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(...pdfColors.dark);
        doc.text('Prepared from the Chapter Funds T-shirt orders tab.', marginX, pageHeight - 18);
        doc.text(`Page ${pageNumber}`, pageWidth - marginX, pageHeight - 18, { align: 'right' });
      };

      drawHeader();

      const tableStartY = 136;
      const tableHead = [['#', 'Brother Name', 'Size', 'Qty', 'Price']];
      const totalQty = filteredOrders.reduce((sum, order) => sum + num(order.quantity), 0);
      const totalAmount = filteredOrders.reduce((sum, order) => sum + num(order.total_amount), 0);
      const tableBody = [
        ...filteredOrders.map((order, index) => [
          String(index + 1),
          order.brother_name,
          order.shirt_size,
          String(num(order.quantity)),
          formatPdfMoney(num(order.total_amount)),
        ]),
        ['', 'TOTAL', '', String(totalQty), formatPdfMoney(totalAmount)],
      ];

      autoTable(doc, {
        startY: tableStartY,
        margin: { top: 132, right: reportX, bottom: 52, left: reportX },
        tableWidth: reportWidth,
        head: tableHead,
        body: tableBody,
        theme: 'grid',
        styles: {
          font: 'helvetica',
          fontSize: 9.4,
          cellPadding: { top: 8, right: 8, bottom: 8, left: 8 },
          lineColor: [...pdfColors.line],
          lineWidth: 0.6,
          textColor: [...pdfColors.black],
        },
        headStyles: {
          fillColor: [...pdfColors.soft],
          textColor: [...pdfColors.black],
          fontStyle: 'bold',
          halign: 'left',
        },
        bodyStyles: {
          valign: 'middle',
        },
        columnStyles: {
          0: { cellWidth: 30, halign: 'center' },
          1: { cellWidth: 250 },
          2: { cellWidth: 60, halign: 'center' },
          3: { cellWidth: 44, halign: 'center' },
          4: { cellWidth: 90, halign: 'right' },
        },
        didParseCell: (data) => {
          const isTotalRow = data.section === 'body' && data.row.index === tableBody.length - 1;
          if (!isTotalRow) return;
          data.cell.styles.fillColor = [...pdfColors.soft];
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.textColor = [...pdfColors.black];
          data.cell.styles.lineColor = [...pdfColors.black];
          data.cell.styles.lineWidth = 0.8;
        },
        didDrawPage: (data) => {
          if (data.pageNumber > 1) drawHeader();
          drawFooter(data.pageNumber);
        },
      });

      const filenameBase = selectedCampaign?.name || `${chapterLabel} tshirt orders`;
      doc.save(`${toFileSlug(filenameBase)}-${generatedAt.toISOString().slice(0, 10)}.pdf`);
      toast('success', 'PDF downloaded.');
    } catch (error) {
      toast('error', error instanceof Error ? error.message : 'Could not generate PDF.');
    } finally {
      setOrderPdfLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="bg-white/[0.04] h-12 animate-pulse rounded-xl" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border-gold/15 bg-white/[0.03] h-28 animate-pulse rounded-2xl border" />
          ))}
        </div>
        <div className="border-gold/15 bg-white/[0.03] h-96 animate-pulse rounded-2xl border" />
      </div>
    );
  }

  if (loadErr || !summary) {
    return (
      <AdminEmptyState
        title="Funds module unavailable"
        description={
          loadErr ||
          'Could not load data. Run db-migration-funds.sql and db-migration-tshirt-campaign-orders.sql on your MySQL database, then refresh.'
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-gold/20 from-gold/[0.06] flex flex-col gap-3 rounded-2xl border bg-gradient-to-r to-transparent px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4"
      >
        <div className="flex min-w-0 items-center gap-3">
          {logoUrl?.trim() ? (
            <AdminBrandMark logoUrl={logoUrl} fallbackSrc="/logo.png" alt={chapterName || 'Chapter'} size="lg" />
          ) : (
            <div className="bg-gold/15 text-gold flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gold/25">
              <Wallet className="h-6 w-6" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-gold/85 text-[10px] font-bold uppercase tracking-[0.2em]">Chapter funds</p>
            {chapterName?.trim() ? (
              <p className="text-gold/95 truncate text-sm font-semibold md:text-base">{chapterName}</p>
            ) : null}
            <p className="text-foreground/75 text-sm font-medium">Transparency · fundraising · disbursements</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 sm:justify-end">
          {TABS.map((t) => {
            const Icon = t.icon;
            const on = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                  on
                    ? 'bg-gold/20 text-gold border-gold/35 border shadow-[0_0_20px_rgba(212,175,55,0.12)]'
                    : 'text-foreground/65 hover:bg-white/6 border border-transparent'
                }`}
              >
                <Icon className="h-3.5 w-3.5 opacity-90" />
                {t.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {tab === 'dashboard' && (
          <motion.div
            key="dash"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Chapter balance"
                value={formatCurrency(balanceAnim)}
                sub="Raised − disbursements"
                icon={Sparkles}
                glow="from-amber-500/20 to-transparent"
              />
              <StatCard
                label="Total funds raised"
                value={formatCurrency(raisedAnim)}
                sub="All fund sources"
                icon={TrendingUp}
                glow="from-emerald-500/15 to-transparent"
              />
              <StatCard
                label="Total disbursements"
                value={formatCurrency(disbAnim)}
                sub="Outgoing funds"
                icon={ArrowUpRight}
                glow="from-rose-500/15 to-transparent"
              />
              <StatCard
                label="Active campaigns"
                value={String(Math.round(campAnim))}
                sub="In date range · active"
                icon={Target}
                glow="from-sky-500/15 to-transparent"
              />
            </div>

            <FundsCharts
              monthlySeries={summary.monthlySeries}
              sourcesByType={summary.sourcesByType}
              disbursementsByCategory={summary.disbursementsByCategory}
            />

            <div className="grid gap-4 lg:grid-cols-3">
              <div className="border-gold/20 bg-gradient-to-br from-white/[0.05] to-transparent lg:col-span-2 rounded-2xl border p-4 md:p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Activity className="text-gold h-5 w-5" />
                  <h3 className="text-foreground text-base font-semibold">Activity</h3>
                </div>
                <ul className="max-h-72 space-y-2 overflow-y-auto pr-1">
                  {summary.activity.length === 0 ? (
                    <p className="text-foreground/45 text-sm">No activity yet.</p>
                  ) : (
                    summary.activity.map((a) => (
                      <li
                        key={a.id}
                        className="border-gold/10 hover:bg-white/4 flex gap-3 rounded-xl border border-transparent px-3 py-2.5 transition"
                      >
                        <span className="bg-gold/10 text-gold mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold uppercase">
                          {a.action_type.slice(0, 2)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-foreground/90 text-sm leading-snug">{a.message}</p>
                          <time className="text-foreground/40 text-[11px] tabular-nums" dateTime={a.created_at}>
                            {formatRelativeTime(a.created_at)}
                          </time>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
              <div className="border-gold/20 bg-gradient-to-br from-white/[0.05] to-transparent rounded-2xl border p-4 md:p-5">
                <div className="mb-3 flex items-center gap-2">
                  <HandCoins className="text-gold h-5 w-5" />
                  <h3 className="text-foreground text-base font-semibold">Quick actions</h3>
                </div>
                <div className="flex flex-col gap-2">
                  <AdminPrimaryButton
                    type="button"
                    className="justify-center"
                    onClick={() => {
                      setTab('sources');
                      setSourceEdit(null);
                      setSourceModal(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add fund source
                  </AdminPrimaryButton>
                  <AdminGhostButton
                    type="button"
                    className="justify-center"
                    onClick={() => {
                      setTab('disbursements');
                      setDisEdit(null);
                      setDisModal(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Record disbursement
                  </AdminGhostButton>
                  <AdminGhostButton
                    type="button"
                    className="justify-center"
                    onClick={() => {
                      setTab('campaigns');
                      setCampEdit(null);
                      setCampModal(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" /> New campaign
                  </AdminGhostButton>
                  <AdminGhostButton type="button" className="justify-center" onClick={() => setTab('orders')}>
                    <HandCoins className="mr-2 h-4 w-4" /> Review orders
                  </AdminGhostButton>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {tab === 'sources' && (
          <motion.section
            key="src"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 w-full flex-nowrap items-center gap-2 overflow-x-auto sm:overflow-visible">
                <input
                  type="search"
                  placeholder="Search fund sources…"
                  value={srcSearch}
                  onChange={(e) => setSrcSearch(e.target.value)}
                  className={`${adminInputClass()} !w-auto min-w-[10rem] flex-1`}
                />
                <select
                  value={srcSort}
                  onChange={(e) => setSrcSort(e.target.value as 'date' | 'amount')}
                  className={`${adminInputClass()} !w-auto min-w-[11rem] shrink-0`}
                >
                  <option value="date">Sort by date</option>
                  <option value="amount">Sort by amount</option>
                </select>
                <select
                  value={srcOrder}
                  onChange={(e) => setSrcOrder(e.target.value as 'asc' | 'desc')}
                  className={`${adminInputClass()} !w-auto min-w-[9.5rem] shrink-0`}
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
              <AdminPrimaryButton
                type="button"
                onClick={() => {
                  setSourceEdit(null);
                  setSourceModal(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" /> Add
              </AdminPrimaryButton>
            </div>

            {filteredSources.length === 0 ? (
              <AdminEmptyState title="No fund sources" description="Add donations, event proceeds, or contributions." />
            ) : (
              <ul className="space-y-2">
                {srcSlice.map((row) => (
                  <li
                    key={row.id}
                    className="border-gold/12 hover:border-gold/25 group flex flex-col gap-3 rounded-2xl border bg-black/25 px-4 py-3 transition hover:bg-white/[0.04] sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-foreground font-semibold">{row.title}</p>
                      <p className="text-foreground/55 mt-1 text-sm">
                        {fundSourceTypeLabel(row)} · {row.source_date}
                        {row.campaign_name ? ` · ${row.campaign_name}` : ''}
                      </p>
                      {row.description ? (
                        <p className="text-foreground/45 mt-1 line-clamp-2 text-sm">{row.description}</p>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gold text-lg font-bold tabular-nums">{formatCurrency(num(row.amount))}</span>
                      <button
                        type="button"
                        className="text-foreground/50 hover:text-gold rounded-lg p-2 transition"
                        onClick={() => {
                          setSourceEdit(row);
                          setSourceModal(true);
                        }}
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="text-foreground/50 hover:text-rose-400 rounded-lg p-2 transition"
                        onClick={() => setDeleteTarget({ kind: 'source', id: row.id, title: row.title })}
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {filteredSources.length > PAGE ? (
              <AdminPagination page={srcPage} totalPages={srcPages} onPageChange={setSrcPage} />
            ) : null}
          </motion.section>
        )}

        {tab === 'disbursements' && (
          <motion.section
            key="dis"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 w-full flex-nowrap items-center gap-2 overflow-x-auto sm:overflow-visible">
                <input
                  type="search"
                  placeholder="Search disbursements…"
                  value={disSearch}
                  onChange={(e) => setDisSearch(e.target.value)}
                  className={`${adminInputClass()} !w-auto min-w-[10rem] flex-1`}
                />
                <select
                  value={disSort}
                  onChange={(e) => setDisSort(e.target.value as 'date' | 'amount')}
                  className={`${adminInputClass()} !w-auto min-w-[11rem] shrink-0`}
                >
                  <option value="date">Sort by date</option>
                  <option value="amount">Sort by amount</option>
                </select>
                <select
                  value={disOrder}
                  onChange={(e) => setDisOrder(e.target.value as 'asc' | 'desc')}
                  className={`${adminInputClass()} !w-auto min-w-[9.5rem] shrink-0`}
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
              <AdminPrimaryButton
                type="button"
                onClick={() => {
                  setDisEdit(null);
                  setDisModal(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" /> Add
              </AdminPrimaryButton>
            </div>

            {filteredDis.length === 0 ? (
              <AdminEmptyState title="No disbursements" description="Record chapter expenses with category and purpose." />
            ) : (
              <ul className="space-y-2">
                {disSlice.map((row) => (
                  <li
                    key={row.id}
                    className={`border-gold/12 hover:border-gold/25 flex flex-col gap-3 rounded-2xl border border-l-4 bg-black/25 px-4 py-3 transition hover:bg-white/[0.04] sm:flex-row sm:items-center sm:justify-between ${categoryBorder(row.category)}`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-foreground font-semibold">{row.title}</p>
                      <p className="text-foreground/55 mt-1 text-sm">
                        <span className="text-gold/90 font-medium">{row.category}</span> · {row.disbursement_date}
                      </p>
                      {row.purpose ? (
                        <p className="text-foreground/45 mt-1 line-clamp-2 text-sm">{row.purpose}</p>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-rose-300/95 text-lg font-bold tabular-nums">
                        {formatCurrency(num(row.amount))}
                      </span>
                      <button
                        type="button"
                        className="text-foreground/50 hover:text-gold rounded-lg p-2"
                        onClick={() => {
                          setDisEdit(row);
                          setDisModal(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="text-foreground/50 hover:text-rose-400 rounded-lg p-2"
                        onClick={() => setDeleteTarget({ kind: 'dis', id: row.id, title: row.title })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {filteredDis.length > PAGE ? (
              <AdminPagination page={disPage} totalPages={disPages} onPageChange={setDisPage} />
            ) : null}
          </motion.section>
        )}

        {tab === 'campaigns' && (
          <motion.section
            key="camp"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex justify-end">
              <AdminPrimaryButton
                type="button"
                onClick={() => {
                  setCampEdit(null);
                  setCampModal(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" /> New campaign
              </AdminPrimaryButton>
            </div>

            {campaigns.length === 0 ? (
              <AdminEmptyState
                title="No campaigns"
                description="Create a fundraising drive with a goal and timeline."
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {campaigns.map((c) => {
                  const goal = num(c.goal_amount);
                  const raised = num(c.raised);
                  const pct = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;
                  const active = c.status === 'active';
                  const isTShirt = c.campaign_type === 'tshirt';
                  const campaignPhotoCount = c.image_urls?.length ?? (c.cover_image_url ? 1 : 0);
                  return (
                    <motion.button
                      key={c.id}
                      type="button"
                      layout
                      whileHover={{ y: -4 }}
                      onClick={() => void openCampDetail(c)}
                      className="border-gold/18 hover:border-gold/35 text-left transition shadow-lg shadow-black/25 bg-gradient-to-br from-white/[0.07] to-transparent rounded-2xl border p-4"
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <p className="text-foreground line-clamp-2 min-w-0 flex-1 font-semibold">{c.name}</p>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                              active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-foreground/70'
                            }`}
                          >
                            {c.status}
                          </span>
                          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-foreground/70">
                            {isTShirt ? 'T-shirt' : 'General'}
                          </span>
                        </div>
                      </div>
                      <p className="text-foreground/50 mb-3 text-xs">
                        {c.start_date} → {c.end_date}
                      </p>
                      <div className="bg-black/30 mb-1 h-2 overflow-hidden rounded-full">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-gold to-amber-600"
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                      </div>
                      <div className="text-foreground/70 flex justify-between text-xs">
                        <span>
                          {formatCurrency(raised)} / {formatCurrency(goal)}
                        </span>
                        <span className="text-gold font-semibold">{pct}%</span>
                      </div>
                      {isTShirt ? (
                        <div className="text-foreground/55 mt-3 flex items-center justify-between text-xs">
                          <span>{num(c.order_count)} orders</span>
                          <span>{campaignPhotoCount} photo{campaignPhotoCount === 1 ? '' : 's'}</span>
                          <span>{num(c.shirts_sold)} shirts</span>
                        </div>
                      ) : null}
                    </motion.button>
                  );
                })}
              </div>
            )}
          </motion.section>
        )}

        {tab === 'orders' && (
          <motion.section
            key="orders"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Collected from orders"
                value={formatCurrency(filteredOrderSummary.totalCollected)}
                sub={orderCampaign === 'all' ? 'All T-shirt orders' : 'Filtered campaign'}
                icon={HandCoins}
                glow="from-emerald-500/15 to-transparent"
              />
              <StatCard
                label="Recorded orders"
                value={String(filteredOrderSummary.totalOrders)}
                sub="Each submission from brothers"
                icon={Megaphone}
                glow="from-sky-500/15 to-transparent"
              />
              <StatCard
                label="Shirts requested"
                value={String(filteredOrderSummary.totalShirts)}
                sub="Quantities across all sizes"
                icon={Target}
                glow="from-amber-500/15 to-transparent"
              />
              <StatCard
                label="Available sizes"
                value={String(filteredOrderSummary.sizeBreakdown.length || ordersOverview.sizeBreakdown.length)}
                sub="Distinct sizes ordered"
                icon={Sparkles}
                glow="from-violet-500/15 to-transparent"
              />
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 w-full flex-col gap-2 sm:flex-row">
                <input
                  type="search"
                  placeholder="Search brothers, emails, campaigns…"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className={`${adminInputClass()} !w-auto min-w-[12rem] flex-1`}
                />
                <select
                  value={orderCampaign}
                  onChange={(e) => setOrderCampaign(e.target.value)}
                  className={`${adminInputClass()} !w-auto min-w-[14rem] shrink-0`}
                >
                  <option value="all">All campaigns</option>
                  {campaigns
                    .filter((campaign) => campaign.campaign_type === 'tshirt')
                    .map((campaign) => (
                      <option key={campaign.id} value={campaign.id}>
                        {campaign.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex flex-col gap-3 lg:items-end">
                <AdminPrimaryButton
                  type="button"
                  onClick={() => void downloadOrderPdf()}
                  disabled={filteredOrders.length === 0}
                  loading={orderPdfLoading}
                >
                  <Download className="h-4 w-4" /> Export PDF
                </AdminPrimaryButton>

                <div className="rounded-2xl border border-gold/15 bg-black/20 px-4 py-3 text-sm">
                  <p className="text-foreground/55 text-[11px] font-semibold uppercase tracking-[0.14em]">Size breakdown</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(filteredOrderSummary.sizeBreakdown.length > 0
                      ? filteredOrderSummary.sizeBreakdown
                      : ordersOverview.sizeBreakdown
                    ).map((entry) => (
                      <span
                        key={entry.size}
                        className="rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold"
                      >
                        {entry.size}: {entry.quantity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <AdminEmptyState
                title="No T-shirt orders yet"
                description="Orders submitted from the public campaign feed will appear here automatically."
              />
            ) : (
              <ul className="space-y-2">
                {orderSlice.map((order) => (
                  <li
                    key={order.id}
                    className="border-gold/12 hover:border-gold/25 rounded-2xl border bg-black/25 px-4 py-3 transition hover:bg-white/[0.04]"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-foreground font-semibold">{order.brother_name}</p>
                          <span className="rounded-full border border-gold/20 bg-gold/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gold">
                            {order.shirt_size}
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-foreground/70">
                            Qty {num(order.quantity)}
                          </span>
                        </div>
                        <p className="text-foreground/55 mt-1 text-sm">
                          {order.campaign_name || 'Campaign'} · {order.email}
                          {order.phone ? ` · ${order.phone}` : ''}
                        </p>
                        {order.notes ? (
                          <p className="text-foreground/45 mt-2 text-sm leading-relaxed">{order.notes}</p>
                        ) : null}
                      </div>
                      <div className="flex flex-col items-start gap-1 text-sm lg:items-end">
                        <span className="text-gold text-lg font-bold tabular-nums">
                          {formatCurrency(num(order.total_amount))}
                        </span>
                        <span className="text-foreground/45 tabular-nums">
                          {formatCurrency(num(order.unit_price))} each
                        </span>
                        <time className="text-foreground/40 text-xs" dateTime={order.created_at}>
                          {formatRelativeTime(order.created_at)}
                        </time>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {filteredOrders.length > PAGE ? (
              <AdminPagination page={orderPage} totalPages={orderPages} onPageChange={setOrderPage} />
            ) : null}
          </motion.section>
        )}

        {tab === 'reports' && (
          <motion.section
            key="rep"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-foreground text-lg font-semibold">Reports &amp; insights</h3>
              <AdminPrimaryButton type="button" onClick={downloadCsv}>
                <Download className="mr-2 h-4 w-4" /> Export CSV
              </AdminPrimaryButton>
            </div>

            <div className="border-gold/20 overflow-hidden rounded-2xl border">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/[0.04] text-foreground/60">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Month</th>
                    <th className="px-4 py-3 font-semibold">Raised</th>
                    <th className="px-4 py-3 font-semibold">Disbursed</th>
                    <th className="px-4 py-3 font-semibold">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.monthlySeries.map((m) => {
                    const net = m.raised - m.disbursed;
                    return (
                      <tr key={m.month} className="border-gold/10 hover:bg-white/[0.03] border-t">
                        <td className="text-foreground px-4 py-2.5 tabular-nums">{m.month}</td>
                        <td className="text-emerald-300/95 px-4 py-2.5 tabular-nums">{formatCurrency(m.raised)}</td>
                        <td className="text-rose-300/90 px-4 py-2.5 tabular-nums">{formatCurrency(m.disbursed)}</td>
                        <td className="text-foreground/85 px-4 py-2.5 font-medium tabular-nums">
                          {formatCurrency(net)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div>
              <h4 className="text-gold/90 mb-2 text-sm font-semibold">Campaign performance</h4>
              <div className="grid gap-2 sm:grid-cols-2">
                {campaigns.map((c) => {
                  const goal = num(c.goal_amount);
                  const raised = num(c.raised);
                  const pct = goal > 0 ? Math.round((raised / goal) * 100) : 0;
                  return (
                    <div
                      key={c.id}
                      className="border-gold/15 rounded-xl border bg-black/20 px-3 py-2 text-sm"
                    >
                      <p className="text-foreground font-medium">{c.name}</p>
                      <p className="text-foreground/55 mt-1">
                        {formatCurrency(raised)} of {formatCurrency(goal)} ({pct}%)
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <FundSourceModal
        key={`source-${sourceEdit?.id ?? 'new'}-${sourceModal ? 'open' : 'closed'}`}
        open={sourceModal}
        onClose={() => {
          setSourceModal(false);
          setSourceEdit(null);
        }}
        initial={sourceEdit}
        campaigns={campaigns}
        saving={saving}
        onSave={async (payload) => {
          setSaving(true);
          try {
            const path =
              sourceEdit != null
                ? `/api/admin/funds/sources/${sourceEdit.id}`
                : '/api/admin/funds/sources';
            const r = await fetch(path, {
              method: sourceEdit != null ? 'PUT' : 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });
            if (!r.ok) {
              const j = await r.json().catch(() => ({}));
              throw new Error(j.error || 'Save failed');
            }
            setSourceModal(false);
            setSourceEdit(null);
            await refresh();
            toast('success', sourceEdit ? 'Fund source updated.' : 'Fund source added.');
          } catch (e) {
            toast('error', e instanceof Error ? e.message : 'Save failed');
          } finally {
            setSaving(false);
          }
        }}
      />

      <DisbursementModal
        key={`dis-${disEdit?.id ?? 'new'}-${disModal ? 'open' : 'closed'}`}
        open={disModal}
        onClose={() => {
          setDisModal(false);
          setDisEdit(null);
        }}
        initial={disEdit}
        saving={saving}
        onSave={async (payload) => {
          setSaving(true);
          try {
            const path =
              disEdit != null
                ? `/api/admin/funds/disbursements/${disEdit.id}`
                : '/api/admin/funds/disbursements';
            const r = await fetch(path, {
              method: disEdit != null ? 'PUT' : 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });
            if (!r.ok) {
              const j = await r.json().catch(() => ({}));
              throw new Error(j.error || 'Save failed');
            }
            setDisModal(false);
            setDisEdit(null);
            await refresh();
            toast('success', disEdit ? 'Disbursement updated.' : 'Disbursement recorded.');
          } catch (e) {
            toast('error', e instanceof Error ? e.message : 'Save failed');
          } finally {
            setSaving(false);
          }
        }}
      />

      <CampaignModal
        key={`campaign-${campEdit?.id ?? 'new'}-${campModal ? 'open' : 'closed'}`}
        open={campModal}
        onClose={() => {
          setCampModal(false);
          setCampEdit(null);
        }}
        initial={campEdit}
        saving={saving}
        toast={toast}
        onSave={async (payload) => {
          setSaving(true);
          try {
            const path =
              campEdit != null
                ? `/api/admin/funds/campaigns/${campEdit.id}`
                : '/api/admin/funds/campaigns';
            const r = await fetch(path, {
              method: campEdit != null ? 'PUT' : 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });
            if (!r.ok) {
              const j = await r.json().catch(() => ({}));
              throw new Error(j.error || 'Save failed');
            }
            setCampModal(false);
            setCampEdit(null);
            await refresh();
            toast('success', campEdit ? 'Campaign updated.' : 'Campaign created.');
          } catch (e) {
            toast('error', e instanceof Error ? e.message : 'Save failed');
          } finally {
            setSaving(false);
          }
        }}
      />

      <DashboardModal
        open={campDetail != null}
        onClose={() => {
          setCampDetail(null);
          setCampDetailRows([]);
          setCampDetailOrders([]);
        }}
        title={campDetail?.name || 'Campaign'}
        description={`${campDetail?.start_date || ''} → ${campDetail?.end_date || ''}`}
        size="lg"
      >
        {campDetailLoading ? (
          <p className="text-foreground/55 text-sm">Loading…</p>
        ) : campDetail ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <p className="text-foreground/50">Goal</p>
                <p className="text-gold text-lg font-bold">{formatCurrency(num(campDetail.goal_amount))}</p>
              </div>
              <div>
                <p className="text-foreground/50">Raised</p>
                <p className="text-foreground text-lg font-bold">{formatCurrency(num(campDetail.raised))}</p>
              </div>
              <div>
                <p className="text-foreground/50">Status</p>
                <p className="text-foreground font-semibold capitalize">{campDetail.status}</p>
              </div>
              {campDetail.campaign_type === 'tshirt' ? (
                <div>
                  <p className="text-foreground/50">Shirt price</p>
                  <p className="text-foreground text-lg font-bold">
                    {formatCurrency(num(campDetail.unit_price))}
                  </p>
                </div>
              ) : null}
            </div>
            {campDetail.campaign_type === 'tshirt' ? (
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-xl border border-gold/12 bg-black/20 px-4 py-3">
                  <p className="text-foreground/50 text-xs uppercase tracking-[0.14em]">Orders</p>
                  <p className="text-gold mt-1 text-xl font-bold">{campDetailOrderSummary.totalOrders}</p>
                </div>
                <div className="rounded-xl border border-gold/12 bg-black/20 px-4 py-3">
                  <p className="text-foreground/50 text-xs uppercase tracking-[0.14em]">Shirts</p>
                  <p className="text-gold mt-1 text-xl font-bold">{campDetailOrderSummary.totalShirts}</p>
                </div>
                <div className="rounded-xl border border-gold/12 bg-black/20 px-4 py-3">
                  <p className="text-foreground/50 text-xs uppercase tracking-[0.14em]">Collected</p>
                  <p className="text-gold mt-1 text-xl font-bold">
                    {formatCurrency(campDetailOrderSummary.totalCollected)}
                  </p>
                </div>
              </div>
            ) : null}
            {campDetail.campaign_type === 'tshirt' ? (
              <div>
                <p className="text-gold/85 mb-2 text-xs font-bold uppercase tracking-wider">Public campaign details</p>
                <div className="space-y-2 rounded-xl border border-gold/12 bg-black/20 p-4 text-sm">
                  {campDetail.image_urls?.length ? (
                    <NewsImageGallery
                      key={`${campDetail.id}-${campDetail.image_urls.join('|')}`}
                      images={campDetail.image_urls}
                      title={campDetail.name}
                      frameClassName="h-56 sm:h-64"
                      className="mb-4"
                    />
                  ) : null}
                  <p className="text-foreground/75">{campDetail.summary || 'No summary set.'}</p>
                  {campDetail.description ? (
                    <p className="text-foreground/55 whitespace-pre-wrap">{campDetail.description}</p>
                  ) : null}
                  <p className="text-foreground/55">
                    Sizes: {(campDetail.size_options && campDetail.size_options.length > 0 ? campDetail.size_options : DEFAULT_TSHIRT_SIZES).join(', ')}
                  </p>
                  {campDetail.slug ? (
                    <p className="text-foreground/40 text-xs">Public slug: /api/campaigns/{campDetail.slug}/orders</p>
                  ) : null}
                </div>
              </div>
            ) : null}
            <div>
              <p className="text-gold/85 mb-2 text-xs font-bold uppercase tracking-wider">Linked contributions</p>
              {campDetailRows.length === 0 ? (
                <p className="text-foreground/45 text-sm">No fund sources linked yet.</p>
              ) : (
                <ul className="max-h-56 space-y-1 overflow-y-auto text-sm">
                  {campDetailRows.map((r) => (
                    <li
                      key={r.id}
                      className="border-gold/10 flex justify-between gap-2 rounded-lg border bg-black/20 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <span className="text-foreground/90 block">{r.title}</span>
                        <span className="text-foreground/45 block text-xs">{fundSourceTypeLabel(r)}</span>
                      </div>
                      <span className="text-gold shrink-0 font-medium tabular-nums">{formatCurrency(num(r.amount))}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {campDetail.campaign_type === 'tshirt' ? (
              <div>
                <p className="text-gold/85 mb-2 text-xs font-bold uppercase tracking-wider">Recorded orders</p>
                {campDetailOrders.length === 0 ? (
                  <p className="text-foreground/45 text-sm">No orders recorded yet.</p>
                ) : (
                  <ul className="max-h-56 space-y-2 overflow-y-auto text-sm">
                    {campDetailOrders.map((order) => (
                      <li
                        key={order.id}
                        className="border-gold/10 rounded-lg border bg-black/20 px-3 py-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <span className="text-foreground/90 block">{order.brother_name}</span>
                            <span className="text-foreground/45 block text-xs">
                              {order.email} · {order.shirt_size} · Qty {num(order.quantity)}
                            </span>
                          </div>
                          <span className="text-gold shrink-0 font-medium tabular-nums">
                            {formatCurrency(num(order.total_amount))}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2 border-t border-white/10 pt-4">
              <AdminGhostButton
                type="button"
                onClick={() => {
                  setCampDetail(null);
                  setCampEdit(campDetail);
                  setCampModal(true);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" /> Edit campaign
              </AdminGhostButton>
              <AdminPrimaryButton
                type="button"
                variant="danger"
                onClick={() =>
                  setDeleteTarget({ kind: 'camp', id: campDetail.id, title: campDetail.name })
                }
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </AdminPrimaryButton>
            </div>
          </div>
        ) : null}
      </DashboardModal>

      <ConfirmModal
        open={deleteTarget != null}
        onClose={() => setDeleteTarget(null)}
        title="Delete this record?"
        message={deleteTarget ? `Remove “${deleteTarget.title}”? This cannot be undone.` : ''}
        loading={deleteLoading}
        danger
        onConfirm={runDelete}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  glow,
}: {
  label: string;
  value: string;
  sub: string;
  icon: import('react').ComponentType<{ className?: string }>;
  glow: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className={`border-gold/22 group relative overflow-hidden rounded-2xl border bg-gradient-to-br ${glow} p-5 shadow-xl shadow-black/30`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.14),transparent_55%)]" />
      <div className="relative flex items-start justify-between gap-2">
        <div>
          <p className="text-foreground/55 text-[11px] font-semibold uppercase tracking-[0.14em]">{label}</p>
          <p className="text-foreground mt-2 text-2xl font-bold tabular-nums tracking-tight md:text-3xl">{value}</p>
          <p className="text-foreground/45 mt-1 text-xs">{sub}</p>
        </div>
        <div className="border-gold/25 bg-gold/12 text-gold flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition duration-300 group-hover:scale-110 group-hover:border-gold/45">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}

function FundSourceModal({
  open,
  onClose,
  initial,
  campaigns,
  saving,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  initial: FundSourceRow | null;
  campaigns: CampaignRow[];
  saving: boolean;
  onSave: (p: Record<string, unknown>) => Promise<void>;
}) {
  const [title, setTitle] = useState(initial?.title || '');
  const [amount, setAmount] = useState(initial != null ? String(initial.amount) : '');
  const [sourceType, setSourceType] = useState(initial?.source_type || 'donations');
  const [sourceDate, setSourceDate] = useState(initial?.source_date?.slice(0, 10) || new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState(initial?.description || '');
  const [campaignId, setCampaignId] = useState(initial?.campaign_id != null ? String(initial.campaign_id) : '');
  const [otherSpecify, setOtherSpecify] = useState(initial?.source_specify?.trim() || '');

  return (
    <DashboardModal
      open={open}
      onClose={onClose}
      title={initial ? 'Edit fund source' : 'Add fund source'}
      description="Record transparent incoming funds for the chapter."
      size="lg"
      footer={
        <>
          <AdminGhostButton type="button" onClick={onClose} disabled={saving}>
            Cancel
          </AdminGhostButton>
          <AdminPrimaryButton
            type="button"
            loading={saving}
            onClick={() =>
              void onSave({
                title,
                amount,
                source_type: sourceType,
                source_specify: sourceType === 'other' ? otherSpecify : null,
                source_date: sourceDate,
                description,
                campaign_id: campaignId === '' ? null : Number(campaignId),
              })
            }
          >
            Save
          </AdminPrimaryButton>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="Title" htmlFor="fund-src-title">
          <input id="fund-src-title" className={adminInputClass()} value={title} onChange={(e) => setTitle(e.target.value)} />
        </AdminField>
        <AdminField label="Amount" htmlFor="fund-src-amount">
          <input id="fund-src-amount" className={adminInputClass()} type="number" min={0} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </AdminField>
        <AdminField label="Source type" htmlFor="fund-src-type">
          <select
            id="fund-src-type"
            className={adminInputClass()}
            value={sourceType}
            onChange={(e) => {
              const v = e.target.value;
              setSourceType(v);
              if (v !== 'other') setOtherSpecify('');
            }}
          >
            {SOURCE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </AdminField>
        <AdminField label="Date" htmlFor="fund-src-date">
          <input id="fund-src-date" className={adminInputClass()} type="date" value={sourceDate} onChange={(e) => setSourceDate(e.target.value)} />
        </AdminField>
        {sourceType === 'other' ? (
          <AdminField label="Specify source type" htmlFor="fund-src-other" className="sm:col-span-2">
            <input
              id="fund-src-other"
              className={adminInputClass()}
              value={otherSpecify}
              onChange={(e) => setOtherSpecify(e.target.value)}
              placeholder="e.g. Equipment co-op, Grant, In-kind…"
              autoComplete="off"
            />
          </AdminField>
        ) : null}
        <AdminField label="Link to campaign (optional)" htmlFor="fund-src-campaign" className="sm:col-span-2">
          <select id="fund-src-campaign" className={adminInputClass()} value={campaignId} onChange={(e) => setCampaignId(e.target.value)}>
            <option value="">— None —</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </AdminField>
        <AdminField label="Description" htmlFor="fund-src-desc" className="sm:col-span-2">
          <textarea id="fund-src-desc" className={`${adminInputClass()} min-h-[88px]`} value={description} onChange={(e) => setDescription(e.target.value)} />
        </AdminField>
      </div>
    </DashboardModal>
  );
}

function DisbursementModal({
  open,
  onClose,
  initial,
  saving,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  initial: DisbursementRow | null;
  saving: boolean;
  onSave: (p: Record<string, unknown>) => Promise<void>;
}) {
  const [title, setTitle] = useState(initial?.title || '');
  const [amount, setAmount] = useState(initial != null ? String(initial.amount) : '');
  const [category, setCategory] = useState(initial?.category || '');
  const [date, setDate] = useState(initial?.disbursement_date?.slice(0, 10) || new Date().toISOString().slice(0, 10));
  const [purpose, setPurpose] = useState(initial?.purpose || '');

  return (
    <DashboardModal
      open={open}
      onClose={onClose}
      title={initial ? 'Edit disbursement' : 'Record disbursement'}
      description="Outgoing chapter funds — keep categories consistent for reporting."
      size="lg"
      footer={
        <>
          <AdminGhostButton type="button" onClick={onClose} disabled={saving}>
            Cancel
          </AdminGhostButton>
          <AdminPrimaryButton
            type="button"
            loading={saving}
            onClick={() => void onSave({ title, amount, category, disbursement_date: date, purpose })}
          >
            Save
          </AdminPrimaryButton>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="Title" htmlFor="fund-dis-title">
          <input id="fund-dis-title" className={adminInputClass()} value={title} onChange={(e) => setTitle(e.target.value)} />
        </AdminField>
        <AdminField label="Amount" htmlFor="fund-dis-amount">
          <input id="fund-dis-amount" className={adminInputClass()} type="number" min={0.01} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </AdminField>
        <AdminField label="Category" htmlFor="fund-dis-cat">
          <input
            id="fund-dis-cat"
            className={adminInputClass()}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Events, Supplies, Charity"
          />
        </AdminField>
        <AdminField label="Date" htmlFor="fund-dis-date">
          <input id="fund-dis-date" className={adminInputClass()} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </AdminField>
        <AdminField label="Purpose" htmlFor="fund-dis-purpose" className="sm:col-span-2">
          <textarea id="fund-dis-purpose" className={`${adminInputClass()} min-h-[88px]`} value={purpose} onChange={(e) => setPurpose(e.target.value)} />
        </AdminField>
      </div>
    </DashboardModal>
  );
}

function CampaignModal({
  open,
  onClose,
  initial,
  saving,
  toast,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  initial: CampaignRow | null;
  saving: boolean;
  toast: ToastFn;
  onSave: (p: Record<string, unknown>) => Promise<void>;
}) {
  const defaultToday = new Date();
  const defaultEnd = new Date(defaultToday);
  defaultEnd.setMonth(defaultEnd.getMonth() + 2);

  const [name, setName] = useState(initial?.name || '');
  const [goal, setGoal] = useState(initial != null ? String(initial.goal_amount) : '');
  const [start, setStart] = useState(initial?.start_date?.slice(0, 10) || defaultToday.toISOString().slice(0, 10));
  const [end, setEnd] = useState(initial?.end_date?.slice(0, 10) || defaultEnd.toISOString().slice(0, 10));
  const [status, setStatus] = useState(initial?.status || 'active');
  const [campaignType, setCampaignType] = useState<'general' | 'tshirt'>(initial?.campaign_type === 'tshirt' ? 'tshirt' : 'general');
  const [slug, setSlug] = useState(initial?.slug || '');
  const [summary, setSummary] = useState(initial?.summary || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [campaignImageUrls, setCampaignImageUrls] = useState(parseCampaignImageUrls(initial?.image_urls, initial?.cover_image_url));
  const [campaignUploadError, setCampaignUploadError] = useState('');
  const [campaignUploadingCurrent, setCampaignUploadingCurrent] = useState(0);
  const [campaignUploadingTotal, setCampaignUploadingTotal] = useState(0);
  const [unitPrice, setUnitPrice] = useState(initial?.unit_price != null ? String(initial.unit_price) : '');
  const [sizeOptions, setSizeOptions] = useState(
    initial?.size_options && initial.size_options.length > 0
      ? initial.size_options.join(', ')
      : DEFAULT_TSHIRT_SIZES.join(', '),
  );

  const resetCampaignUploadProgress = () => {
    setCampaignUploadingCurrent(0);
    setCampaignUploadingTotal(0);
  };

  const handleCampaignImagesUpload = async (files: FileList | null) => {
    const selectedFiles = Array.from(files ?? []);
    if (selectedFiles.length === 0) return;

    const remainingSlots = Math.max(0, MAX_CAMPAIGN_IMAGES - campaignImageUrls.length);
    if (remainingSlots === 0) {
      toast('error', `You can upload up to ${MAX_CAMPAIGN_IMAGES} photos per T-shirt campaign.`);
      return;
    }

    const uploadQueue = selectedFiles.slice(0, remainingSlots);
    if (uploadQueue.length < selectedFiles.length) {
      toast('error', `Only ${remainingSlots} photo${remainingSlots === 1 ? '' : 's'} can still be added.`);
    }

    setCampaignUploadError('');
    setCampaignUploadingCurrent(0);
    setCampaignUploadingTotal(uploadQueue.length);

    let uploadedCount = 0;
    try {
      for (let index = 0; index < uploadQueue.length; index += 1) {
        const file = uploadQueue[index];
        setCampaignUploadingCurrent(index + 1);

        const body = new FormData();
        body.append('file', file);

        const response = await fetch('/api/admin/upload', {
          method: 'POST',
          credentials: 'include',
          body,
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(typeof data.error === 'string' ? data.error : `Upload failed for ${file.name}`);
        }

        uploadedCount += 1;
        setCampaignImageUrls((prev) => cleanCampaignImageUrls([...prev, data.url]));
      }

      toast('success', uploadedCount === 1 ? 'Campaign photo uploaded.' : `${uploadedCount} campaign photos uploaded.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      setCampaignUploadError(message);
      toast('error', `Upload failed: ${message}`);
    } finally {
      resetCampaignUploadProgress();
    }
  };

  const removeCampaignImage = (url: string) => {
    setCampaignUploadError('');
    setCampaignImageUrls((prev) => prev.filter((entry) => entry !== url));
  };

  const makeCampaignImageCover = (url: string) => {
    setCampaignImageUrls((prev) => [url, ...prev.filter((entry) => entry !== url)]);
  };

  return (
    <DashboardModal
      open={open}
      onClose={() => {
        if (campaignUploadingTotal > 0) return;
        onClose();
      }}
      title={initial ? 'Edit campaign' : 'New fundraising campaign'}
      description="Set a goal and timeline. T-shirt campaigns appear in the public feed and accept recorded orders."
      size="lg"
      footer={
        <>
          <AdminGhostButton type="button" onClick={onClose} disabled={saving || campaignUploadingTotal > 0}>
            Cancel
          </AdminGhostButton>
          <AdminPrimaryButton
            type="button"
            loading={saving}
            disabled={campaignUploadingTotal > 0}
            onClick={() =>
              void onSave({
                name,
                goal_amount: goal,
                start_date: start,
                end_date: end,
                status,
                campaign_type: campaignType,
                slug,
                summary,
                description,
                cover_image_url: campaignType === 'tshirt' ? campaignImageUrls[0] || null : null,
                image_urls: campaignType === 'tshirt' ? campaignImageUrls : [],
                unit_price: unitPrice,
                size_options: sizeOptions,
              })
            }
          >
            Save
          </AdminPrimaryButton>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="Campaign name" htmlFor="fund-camp-name" className="sm:col-span-2">
          <input id="fund-camp-name" className={adminInputClass()} value={name} onChange={(e) => setName(e.target.value)} />
        </AdminField>
        <AdminField label="Goal amount" htmlFor="fund-camp-goal">
          <input id="fund-camp-goal" className={adminInputClass()} type="number" min={0.01} step="0.01" value={goal} onChange={(e) => setGoal(e.target.value)} />
        </AdminField>
        <AdminField label="Campaign type" htmlFor="fund-camp-type">
          <select
            id="fund-camp-type"
            className={adminInputClass()}
            value={campaignType}
            onChange={(e) => setCampaignType(e.target.value as 'general' | 'tshirt')}
          >
            <option value="general">General fundraiser</option>
            <option value="tshirt">T-shirt sale</option>
          </select>
        </AdminField>
        <div className="grid gap-4 sm:col-span-2 sm:grid-cols-2">
          <AdminField label="Start date" htmlFor="fund-camp-start">
            <input id="fund-camp-start" className={adminInputClass()} type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          </AdminField>
          <AdminField label="End date" htmlFor="fund-camp-end">
            <input id="fund-camp-end" className={adminInputClass()} type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
          </AdminField>
        </div>
        <AdminField label="Status" htmlFor="fund-camp-status">
          <select id="fund-camp-status" className={adminInputClass()} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </AdminField>
        {campaignType === 'tshirt' ? (
          <>
            <AdminField label="Public slug" htmlFor="fund-camp-slug">
              <input
                id="fund-camp-slug"
                className={adminInputClass()}
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="Auto-generated if blank"
              />
            </AdminField>
            <AdminField label="Shirt price" htmlFor="fund-camp-price">
              <input
                id="fund-camp-price"
                className={adminInputClass()}
                type="number"
                min={0.01}
                step="0.01"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
              />
            </AdminField>
            <AdminField label="Feed summary" htmlFor="fund-camp-summary" className="sm:col-span-2">
              <textarea
                id="fund-camp-summary"
                className={`${adminInputClass()} min-h-[88px]`}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Short summary shown in the chapter feed"
              />
            </AdminField>
            <AdminField label="Campaign description" htmlFor="fund-camp-desc" className="sm:col-span-2">
              <textarea
                id="fund-camp-desc"
                className={`${adminInputClass()} min-h-[120px]`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Longer description shown when brothers open the campaign"
              />
            </AdminField>
            <AdminField label="Available sizes" htmlFor="fund-camp-sizes" className="sm:col-span-2">
              <input
                id="fund-camp-sizes"
                className={adminInputClass()}
                value={sizeOptions}
                onChange={(e) => setSizeOptions(e.target.value)}
                placeholder="S, M, L, XL, 2XL"
              />
            </AdminField>
            <AdminField label="Campaign images" htmlFor="fund-camp-img" className="sm:col-span-2">
              <div className="space-y-3">
                <label
                  htmlFor="fund-camp-img"
                  className={`border-gold/20 flex cursor-pointer flex-col rounded-2xl border border-dashed px-4 py-4 text-sm transition ${
                    campaignUploadingTotal > 0 || campaignImageUrls.length >= MAX_CAMPAIGN_IMAGES
                      ? 'cursor-not-allowed opacity-60'
                      : 'hover:border-gold/40 hover:bg-white/[0.03]'
                  }`}
                >
                  <input
                    id="fund-camp-img"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    className="sr-only"
                    disabled={saving || campaignUploadingTotal > 0 || campaignImageUrls.length >= MAX_CAMPAIGN_IMAGES}
                    onChange={(e) => {
                      const files = e.currentTarget.files;
                      void handleCampaignImagesUpload(files);
                      e.currentTarget.value = '';
                    }}
                  />
                  <span className="text-foreground font-medium">
                    {campaignUploadingTotal > 0 ? 'Uploading campaign photos...' : 'Click to upload one or more campaign photos'}
                  </span>
                  <span className="text-foreground/55 mt-1 text-xs">
                    Up to {MAX_CAMPAIGN_IMAGES} photos. The first photo becomes the feed cover.
                  </span>
                </label>
                {campaignUploadingTotal > 0 ? (
                  <p className="text-gold text-xs font-medium">
                    Uploading {campaignUploadingCurrent} of {campaignUploadingTotal}...
                  </p>
                ) : null}
                {campaignImageUrls.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {campaignImageUrls.map((url, index) => (
                      <div key={url} className="rounded-2xl border border-gold/15 bg-black/20 p-3">
                        <div
                          className="h-32 rounded-xl border border-white/10 bg-cover bg-center"
                          style={{ backgroundImage: `url(${url})` }}
                          aria-label={`Campaign photo ${index + 1}`}
                        />
                        <div className="mt-3 flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-foreground text-sm font-medium">
                              {index === 0 ? 'Cover photo' : `Photo ${index + 1}`}
                            </p>
                            <p className="text-foreground/45 mt-1 truncate text-[11px]">{url}</p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            {index !== 0 ? (
                              <button
                                type="button"
                                className="text-gold text-[11px] font-semibold hover:text-foreground"
                                onClick={() => makeCampaignImageCover(url)}
                              >
                                Use as cover
                              </button>
                            ) : null}
                            <button
                              type="button"
                              className="text-rose-300 text-[11px] font-semibold hover:text-rose-200"
                              onClick={() => removeCampaignImage(url)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-foreground/55 flex h-32 items-center justify-center rounded-2xl border border-dashed border-white/10 px-4 text-center text-sm">
                    No campaign photos uploaded yet.
                  </div>
                )}
                <p className="text-foreground/60 text-xs">
                  JPEG, PNG, WEBP, or GIF up to 5MB. Uploaded files are saved in `/public/uploads`.
                </p>
                {campaignImageUrls[0] ? (
                  <p className="text-foreground/55 break-all text-xs">Cover image: {campaignImageUrls[0]}</p>
                ) : null}
                {campaignUploadError ? <p className="text-rose-300 text-xs">{campaignUploadError}</p> : null}
              </div>
            </AdminField>
          </>
        ) : null}
      </div>
    </DashboardModal>
  );
}
