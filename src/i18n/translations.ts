export type Language = 'en' | 'vi';

export interface Translations {
  // Navbar & Global
  platformTitle: string;
  platformSubtitle: string;
  version: string;
  liveFefoEngine: string;
  simulateRbacRole: string;
  languageSelect: string;
  critical: string;
  lots: string;
  units: string;

  // Tabs
  tabExpiry: string;
  tabFefo: string;
  tabTransfers: string;
  tabCatalog: string;
  tabAnalytics: string;
  tabRbac: string;

  // Roles
  roleSuperAdmin: string;
  rolePharmacist: string;
  roleWarehouseStaff: string;
  roleSalesRep: string;
  roleSuperAdminDesc: string;
  rolePharmacistDesc: string;
  roleWarehouseStaffDesc: string;
  roleSalesRepDesc: string;

  // Expiry Dashboard
  expiryRadarTitle: string;
  expiryRadarSubtitle: string;
  warehouseFilter: string;
  allFacilities: string;
  criticalExpiry: string;
  criticalExpiryDesc: string;
  warningShelfLife: string;
  warningShelfLifeDesc: string;
  validShelfLife: string;
  validShelfLifeDesc: string;
  totalMonitoredStock: string;
  lossAtRisk: string;
  valueAtRisk: string;
  valuation: string;
  activeFefoPriority: string;
  searchPlaceholder: string;
  filterStatus: string;
  filterAll: string;
  filterCritical: string;
  filterWarning: string;
  filterValid: string;
  colBatchSku: string;
  colMedicineForm: string;
  colCategory: string;
  colExpiryDate: string;
  colDaysLeft: string;
  colFacilityBin: string;
  colUnits: string;
  colCostValue: string;
  colAction: string;
  btnFefoDispense: string;
  coldChainRequired: string;

  // FEFO Dispenser
  fefoTitle: string;
  fefoSubtitle: string;
  fefoBadge: string;
  step1SelectMed: string;
  step2Warehouse: string;
  step3Quantity: string;
  btnRunFefo: string;
  btnSolving: string;
  fefoSummary: string;
  targetDemand: string;
  allocatedViaFefo: string;
  unfulfilledGap: string;
  totalPickCost: string;
  btnConfirmPick: string;
  pickSuccessBanner: string;
  btnPrintPickSheet: string;
  recommendedPickSeq: string;
  colPriority: string;
  colMfgDate: string;
  colAvailableInLot: string;
  colPickQty: string;
  colSubtotal: string;
  priorityDispatch: string;
  storageReq: string;
  ambientStorage: string;
  coldStorage: string;

  // Transfers
  transferTitle: string;
  transferSubtitle: string;
  btnNewTransfer: string;
  pipelineProgression: string;
  stageDraft: string;
  stageDraftDesc: string;
  stagePending: string;
  stagePendingDesc: string;
  stageDispatched: string;
  stageDispatchedDesc: string;
  stageReconciled: string;
  stageReconciledDesc: string;
  btnSubmitApproval: string;
  btnReviseDraft: string;
  btnApproveDispatch: string;
  btnReceiveReconcile: string;
  btnCancelOrder: string;
  reconciliationComplete: string;
  actionAvailableForRole: string;
  transferredBatches: string;
  auditTrail: string;
  initiator: string;
  approvedBy: string;

  // Create Transfer Modal
  modalTitle: string;
  originFacility: string;
  destinationFacility: string;
  routingNotes: string;
  routingNotesPlaceholder: string;
  addBatchesTitle: string;
  btnAddItem: string;
  noLotsStaged: string;
  btnCancel: string;
  btnCreateDraft: string;

  // Medicine Catalog
  catalogTitle: string;
  catalogSubtitle: string;
  searchFormulary: string;
  inspectBatches: string;
  hideBatches: string;
  activeBatchesInDist: string;
  initialUnits: string;
  margin: string;

  // BI Analytics
  analyticsTitle: string;
  analyticsSubtitle: string;
  kpiTotalPortfolio: string;
  kpiGrossMargin: string;
  kpiCriticalExposure: string;
  kpiFefoSavings: string;
  acquisitionCost: string;
  estProfit: string;
  spoilageReduction: string;
  financialMarginByCategory: string;
  categoryDesc: string;
  colTherapeuticCategory: string;
  colSkus: string;
  colHoldingCost: string;
  colProjectedRevenue: string;
  colGrossProfit: string;
  impendingLossTitle: string;
  lossExposure90Days: string;
  queryIndexTitle: string;
  queryIndexDesc: string;

  // RBAC
  rbacTitle: string;
  rbacSubtitle: string;
  permissionMatrixTitle: string;
  permissionMatrixSubtitle: string;
  activeSession: string;
  switchToPersona: string;
  colFeatureRoute: string;

  // Footer
  footerCopyright: string;
  footerCompliance: string;
  footerBackend: string;
  footerEngine: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    platformTitle: 'PharmaTrack',
    platformSubtitle: 'Batch-Tracked Supply Chain & Distribution',
    version: 'ERP v1.4',
    liveFefoEngine: 'Live FEFO Engine',
    simulateRbacRole: 'Simulate RBAC Role:',
    languageSelect: 'Language / Ngôn ngữ:',
    critical: 'Critical',
    lots: 'Lots',
    units: 'units',

    tabExpiry: 'Expiry Dashboard',
    tabFefo: 'FEFO Dispensing Engine',
    tabTransfers: 'Inter-Warehouse Transfers',
    tabCatalog: 'Medicines & Batches',
    tabAnalytics: 'BI & Financial Analytics',
    tabRbac: 'RBAC & Security',

    roleSuperAdmin: 'Super Admin',
    rolePharmacist: 'Lead Pharmacist',
    roleWarehouseStaff: 'Warehouse Staff',
    roleSalesRep: 'Sales Rep',
    roleSuperAdminDesc: 'System Architect & Chief Medical Officer. Unrestricted enterprise oversight.',
    rolePharmacistDesc: 'Formulary Director. Authorizes scheduled medicines, FEFO dispensing, and transfers.',
    roleWarehouseStaffDesc: 'Logistics Supervisor. Physical stock fulfillment, barcoding, and receiving.',
    roleSalesRepDesc: 'Territory Accounts. Read-only inventory and formulary checking for client quotes.',

    expiryRadarTitle: 'Inventory Expiry & Risk Radar',
    expiryRadarSubtitle: 'Real-time surveillance of drug lots expiring under 30 days (Critical Red) and under 90 days (Warning Amber).',
    warehouseFilter: 'Warehouse:',
    allFacilities: 'All Facilities (Global Enterprise)',
    criticalExpiry: 'Critical Expiry (< 30 Days)',
    criticalExpiryDesc: 'Priority dispatch required to prevent spoilage',
    warningShelfLife: 'Warning Shelf Life (< 90 Days)',
    warningShelfLifeDesc: 'Upcoming expiry window for rebalancing',
    validShelfLife: 'Valid Shelf Life (> 90 Days)',
    validShelfLifeDesc: 'Healthy compliant inventory lots',
    totalMonitoredStock: 'Total Monitored Stock',
    lossAtRisk: 'Loss At Risk:',
    valueAtRisk: 'Value At Risk:',
    valuation: 'Valuation:',
    activeFefoPriority: 'Active FEFO Priority Engine On',
    searchPlaceholder: 'Search batch #, drug name, or SKU...',
    filterStatus: 'Filter Status:',
    filterAll: 'All',
    filterCritical: 'Critical',
    filterWarning: 'Warning',
    filterValid: 'Valid',
    colBatchSku: 'Batch Number / SKU',
    colMedicineForm: 'Medicine & Form',
    colCategory: 'Category',
    colExpiryDate: 'Expiry Date',
    colDaysLeft: 'Days Left',
    colFacilityBin: 'Facility / Bin',
    colUnits: 'Units',
    colCostValue: 'Cost Value',
    colAction: 'FEFO Action',
    btnFefoDispense: 'FEFO Dispense',
    coldChainRequired: 'Requires Cold Chain 2-8°C',

    fefoTitle: 'First-Expired, First-Out (FEFO) Recommendation Engine',
    fefoSubtitle: 'Algorithmic batch allocation prioritizing the earliest expiring active lots to minimize spoilage and expired drug write-offs.',
    fefoBadge: 'FDA & cGMP Compliant',
    step1SelectMed: '1. Select Medicine SKU',
    step2Warehouse: '2. Dispensing Warehouse',
    step3Quantity: '3. Requested Dispense Units',
    btnRunFefo: 'Run FEFO',
    btnSolving: 'Solving...',
    fefoSummary: 'FEFO Allocation Summary',
    targetDemand: 'Target Demand:',
    allocatedViaFefo: 'Allocated via FEFO:',
    unfulfilledGap: 'Unfulfilled Gap:',
    totalPickCost: 'Total Pick Cost:',
    btnConfirmPick: 'Confirm & Print Pick Ticket',
    pickSuccessBanner: 'Pick ticket generated and sent to warehouse RF barcode scanners. Stock successfully allocated according to FEFO sequence.',
    btnPrintPickSheet: 'Print Pick Sheet',
    recommendedPickSeq: 'Recommended Pick Sequence (Earliest Expiry First)',
    colPriority: 'Priority Pick #',
    colMfgDate: 'Mfg Date',
    colAvailableInLot: 'Available in Lot',
    colPickQty: 'Pick Qty',
    colSubtotal: 'Subtotal Cost',
    priorityDispatch: 'Priority Dispatch',
    storageReq: 'Storage Req:',
    ambientStorage: 'Ambient (15°C - 25°C)',
    coldStorage: 'Cold Chain (2°C - 8°C)',

    transferTitle: 'Inter-Warehouse Transfer Workflow',
    transferSubtitle: 'Governed transfer chain: Draft → Pending Approval → Dispatched → Received & Reconciled',
    btnNewTransfer: 'New Transfer Order',
    pipelineProgression: 'Supply Chain Lifecycle Progression',
    stageDraft: '1. Draft',
    stageDraftDesc: 'Staged by dispensary',
    stagePending: '2. Pending Approval',
    stagePendingDesc: 'Pharmacist verification',
    stageDispatched: '3. Dispatched',
    stageDispatchedDesc: 'In-transit with cold-chain lock',
    stageReconciled: '4. Reconciled',
    stageReconciledDesc: 'Restocked at destination',
    btnSubmitApproval: 'Submit for Approval',
    btnReviseDraft: 'Revise / Back to Draft',
    btnApproveDispatch: 'Approve & Dispatch Order',
    btnReceiveReconcile: 'Receive & Reconcile Inbound Stock',
    btnCancelOrder: 'Cancel Order',
    reconciliationComplete: 'Reconciliation Complete (Stock Transferred)',
    actionAvailableForRole: 'State Action Available for Role:',
    transferredBatches: 'Transferred Batches & Quantities:',
    auditTrail: 'Audit Trail & Governance:',
    initiator: 'Initiator:',
    approvedBy: 'Approved By:',

    modalTitle: 'Create Inter-Warehouse Transfer Order',
    originFacility: 'Origin Facility (Source)',
    destinationFacility: 'Destination Warehouse',
    routingNotes: 'Order Notes / Routing Justification',
    routingNotesPlaceholder: 'e.g. Critical cold-chain rebalance for hospital pediatric unit',
    addBatchesTitle: 'Add Batch Lots to Transfer',
    btnAddItem: 'Add Item',
    noLotsStaged: 'No lots staged. Select a batch above and click "Add Item".',
    btnCancel: 'Cancel',
    btnCreateDraft: 'Create Draft Transfer',

    catalogTitle: 'Pharmaceutical Formulary & Batch Master',
    catalogSubtitle: 'Relational master catalog containing antibiotics, pain relief, vaccines, cardiovascular, endocrine, and oncology biologics.',
    searchFormulary: 'Search formulation, generic name, or SKU...',
    inspectBatches: 'Inspect Batches',
    hideBatches: 'Hide Batches',
    activeBatchesInDist: 'Active Batches in Distribution:',
    initialUnits: 'Initial:',
    margin: 'Margin',

    analyticsTitle: 'Enterprise BI Analytics & Loss Mitigation Engine',
    analyticsSubtitle: 'Executive portfolio performance, projected margins by pharmaceutical category, and algorithmic FEFO loss salvage modeling.',
    kpiTotalPortfolio: 'Total Portfolio Value (Retail)',
    kpiGrossMargin: 'Projected Gross Margin',
    kpiCriticalExposure: 'Critical Expiry Exposure (<30d)',
    kpiFefoSavings: 'FEFO Loss Savings Modeled',
    acquisitionCost: 'Acquisition Cost:',
    estProfit: 'Est. Profit:',
    spoilageReduction: '~72% Spoilage Reduction',
    financialMarginByCategory: 'Financial Margin by Therapeutic Category',
    categoryDesc: 'Aggregated revenue potential and margin efficiency',
    colTherapeuticCategory: 'Therapeutic Category',
    colSkus: 'SKUs',
    colHoldingCost: 'Holding Cost',
    colProjectedRevenue: 'Projected Revenue',
    colGrossProfit: 'Gross Profit',
    impendingLossTitle: 'Impending Expiry Financial Exposure',
    lossExposure90Days: 'Total 90-Day Loss Exposure:',
    queryIndexTitle: 'Query Index Optimization Blueprint',
    queryIndexDesc: 'To ensure sub-10ms FEFO ordering and inter-warehouse lookups across 1,000,000+ batch records, PostgreSQL & SQLite compound B-Tree indexes are deployed:',

    rbacTitle: 'Role-Based Access Control (RBAC) & Security Policy',
    rbacSubtitle: 'Cryptographically signed JWT tokens with route guard policies enforced across UI components and FastAPI REST routers.',
    permissionMatrixTitle: 'System Permissions & Route Guard Matrix',
    permissionMatrixSubtitle: 'Granular capabilities per authorized role in accordance with 21 CFR Part 11 requirements',
    activeSession: 'Active Session',
    switchToPersona: 'Switch to Persona',
    colFeatureRoute: 'Action / Feature Route',

    footerCopyright: 'PharmaTrack Enterprise ERP',
    footerCompliance: '21 CFR Part 11 & cGMP Validated',
    footerBackend: 'FastAPI + PostgreSQL/SQLite',
    footerEngine: 'FEFO Engine Active',
  },
  vi: {
    platformTitle: 'PharmaTrack',
    platformSubtitle: 'Chuỗi cung ứng & Phân phối Dược phẩm theo Lô',
    version: 'ERP v1.4',
    liveFefoEngine: 'Động cơ FEFO Trực tiếp',
    simulateRbacRole: 'Mô phỏng Vai trò RBAC:',
    languageSelect: 'Ngôn ngữ / Language:',
    critical: 'Khẩn cấp',
    lots: 'Lô',
    units: 'đơn vị',

    tabExpiry: 'Bảng Hạn Dùng & Rủi Ro',
    tabFefo: 'Động Cơ Cấp Phát FEFO',
    tabTransfers: 'Điều Chuyển Liên Kho',
    tabCatalog: 'Danh Mục Thuốc & Lô',
    tabAnalytics: 'Phân Tích BI & Tài Chính',
    tabRbac: 'Phân Quyền RBAC & Bảo Mật',

    roleSuperAdmin: 'Quản Trị Tối Cao (SuperAdmin)',
    rolePharmacist: 'Dược Sĩ Trưởng (Pharmacist)',
    roleWarehouseStaff: 'Nhân Viên Kho (Warehouse Staff)',
    roleSalesRep: 'Đại Diện Kinh Doanh (Sales Rep)',
    roleSuperAdminDesc: 'Kiến trúc sư hệ thống & Giám đốc Y khoa. Toàn quyền giám sát doanh nghiệp.',
    rolePharmacistDesc: 'Giám đốc Danh mục. Phê duyệt thuốc kê đơn, cấp phát FEFO và điều chuyển kho.',
    roleWarehouseStaffDesc: 'Giám sát Logistics. Xuất/nhập kho thực tế, quét mã vạch và đối soát hàng.',
    roleSalesRepDesc: 'Kinh doanh khu vực. Chỉ xem tồn kho và danh mục thuốc để báo giá khách hàng.',

    expiryRadarTitle: 'Radar Giám Sát Hạn Dùng & Rủi Ro Tồn Kho',
    expiryRadarSubtitle: 'Giám sát thời gian thực các lô thuốc hết hạn dưới 30 ngày (Đỏ - Khẩn cấp) và dưới 90 ngày (Hổ phách - Cảnh báo).',
    warehouseFilter: 'Kho hàng:',
    allFacilities: 'Tất cả Cơ sở (Toàn mạng lưới)',
    criticalExpiry: 'Hạn Dùng Khẩn Cấp (< 30 Ngày)',
    criticalExpiryDesc: 'Cần ưu tiên cấp phát ngay để tránh tiêu hủy hỏng thuốc',
    warningShelfLife: 'Hạn Dùng Cảnh Báo (< 90 Ngày)',
    warningShelfLifeDesc: 'Khoảng thời gian cần điều chuyển cân đối tồn kho',
    validShelfLife: 'Hạn Dùng An Toàn (> 90 Ngày)',
    validShelfLifeDesc: 'Các lô hàng đạt chuẩn lưu hành bình thường',
    totalMonitoredStock: 'Tổng Tồn Kho Giám Sát',
    lossAtRisk: 'Giá Trị Rủi Ro:',
    valueAtRisk: 'Giá Trị Cần Lưu Ý:',
    valuation: 'Định Giá:',
    activeFefoPriority: 'Đang Bật Thuật Toán Ưu Tiên FEFO',
    searchPlaceholder: 'Tìm số lô, tên thuốc hoặc mã SKU...',
    filterStatus: 'Lọc Trạng Thái:',
    filterAll: 'Tất cả',
    filterCritical: 'Khẩn cấp',
    filterWarning: 'Cảnh báo',
    filterValid: 'An toàn',
    colBatchSku: 'Số Lô / Mã SKU',
    colMedicineForm: 'Tên Thuốc & Dạng Bào Chế',
    colCategory: 'Nhóm Điều Trị',
    colExpiryDate: 'Ngày Hết Hạn',
    colDaysLeft: 'Còn Lại',
    colFacilityBin: 'Cơ Sở / Vị Trí Ô Kệ',
    colUnits: 'Số Lượng',
    colCostValue: 'Giá Trị Vốn',
    colAction: 'Thao Tác FEFO',
    btnFefoDispense: 'Cấp Phát FEFO',
    coldChainRequired: 'Yêu cầu Bảo quản Lạnh 2-8°C',

    fefoTitle: 'Động Cơ Cấp Phát Hàng Hết Hạn Trước, Xuất Trước (FEFO)',
    fefoSubtitle: 'Thuật toán tự động phân bổ lô thuốc sắp hết hạn nhất để giảm thiểu tối đa hao hụt và chi phí tiêu hủy thuốc quá hạn.',
    fefoBadge: 'Tuân thủ Chuẩn FDA & cGMP',
    step1SelectMed: '1. Chọn Thuốc / SKU',
    step2Warehouse: '2. Kho Cấp Hàng',
    step3Quantity: '3. Số Lượng Cần Cấp',
    btnRunFefo: 'Chạy FEFO',
    btnSolving: 'Đang tính...',
    fefoSummary: 'Tóm Tắt Phân Bổ FEFO',
    targetDemand: 'Nhu Cầu Yêu Cầu:',
    allocatedViaFefo: 'Đã Phân Bổ Qua FEFO:',
    unfulfilledGap: 'Còn Thiếu Chưa Đáp Ứng:',
    totalPickCost: 'Tổng Chi Phí Lấy Hàng:',
    btnConfirmPick: 'Xác Nhận & In Phiếu Soạn Hàng',
    pickSuccessBanner: 'Phiếu lấy hàng đã được tạo và gửi đến máy quét mã vạch RF tại kho. Hàng đã được đặt giữ theo đúng thứ tự FEFO.',
    btnPrintPickSheet: 'In Phiếu Lấy Hàng',
    recommendedPickSeq: 'Trình Tự Lấy Hàng Đề Xuất (Hạn Gần Nhất Xuất Trước)',
    colPriority: 'Thứ Tự #',
    colMfgDate: 'Ngày Sản Xuất',
    colAvailableInLot: 'Khả Dụng Trong Lô',
    colPickQty: 'SL Lấy',
    colSubtotal: 'Thành Tiền',
    priorityDispatch: 'Ưu Tiên Xuất Ngay',
    storageReq: 'Đk Bảo Quản:',
    ambientStorage: 'Nhiệt độ phòng (15°C - 25°C)',
    coldStorage: 'Dây chuyền lạnh (2°C - 8°C)',

    transferTitle: 'Quy Trình Điều Chuyển Liên Kho Hàng',
    transferSubtitle: 'Chu trình kiểm soát chặt chẽ: Nháp → Chờ Phê Duyệt → Đang Vận Chuyển → Đã Nhận & Đối Soát',
    btnNewTransfer: 'Tạo Đơn Điều Chuyển Mới',
    pipelineProgression: 'Tiến Trình Vòng Đời Chuỗi Cung Ứng',
    stageDraft: '1. Bản Nháp',
    stageDraftDesc: 'Lập bởi quầy cấp phát',
    stagePending: '2. Chờ Phê Duyệt',
    stagePendingDesc: 'Dược sĩ thẩm định',
    stageDispatched: '3. Đang Vận Chuyển',
    stageDispatchedDesc: 'Khóa hàng & theo dõi nhiệt độ',
    stageReconciled: '4. Đã Đối Soát',
    stageReconciledDesc: 'Nhập kho đích thành công',
    btnSubmitApproval: 'Gửi Phê Duyệt',
    btnReviseDraft: 'Chỉnh Sửa / Về Nháp',
    btnApproveDispatch: 'Phê Duyệt & Xuất Kho',
    btnReceiveReconcile: 'Tiếp Nhận & Đối Soát Kho',
    btnCancelOrder: 'Hủy Đơn Hàng',
    reconciliationComplete: 'Đã Đối Soát Hoàn Tất (Hàng Đã Chuyển Kho)',
    actionAvailableForRole: 'Thao tác dành cho vai trò:',
    transferredBatches: 'Danh Sách Lô Thuốc & Số Lượng Chuyển:',
    auditTrail: 'Nhật Ký Kiểm Toán & Phê Duyệt:',
    initiator: 'Người Lập:',
    approvedBy: 'Người Duyệt:',

    modalTitle: 'Tạo Lệnh Điều Chuyển Hàng Giữa Các Kho',
    originFacility: 'Kho Xuất Hàng (Nguồn)',
    destinationFacility: 'Kho Nhận Hàng (Đích)',
    routingNotes: 'Ghi Chú Đơn Hàng / Lý Do Điều Chuyển',
    routingNotesPlaceholder: 'vd: Điều chuyển gấp vắc xin cho khoa nhi bệnh viện',
    addBatchesTitle: 'Chọn Các Lô Thuốc Cần Chuyển',
    btnAddItem: 'Thêm Mặt Hàng',
    noLotsStaged: 'Chưa có mặt hàng nào. Vui lòng chọn lô thuốc phía trên và bấm "Thêm Mặt Hàng".',
    btnCancel: 'Hủy Bỏ',
    btnCreateDraft: 'Tạo Đơn Nháp',

    catalogTitle: 'Danh Mục Dược Phẩm & Quản Lý Lô Gốc',
    catalogSubtitle: 'Danh mục thuốc chuẩn hóa gồm kháng sinh, giảm đau, vắc xin sinh phẩm, tim mạch, nội tiết và thuốc ung thư đặc trị.',
    searchFormulary: 'Tìm kiếm biệt dược, hoạt chất hoặc mã SKU...',
    inspectBatches: 'Xem Chi Tiết Lô',
    hideBatches: 'Ẩn Các Lô',
    activeBatchesInDist: 'Các Lô Đang Lưu Hành Trong Hệ Thống:',
    initialUnits: 'Ban đầu:',
    margin: 'Biên độ lãi',

    analyticsTitle: 'Phân Tích Doanh Nghiệp BI & Giảm Thiểu Thất Thoát',
    analyticsSubtitle: 'Hiệu quả tài chính danh mục, biên lợi nhuận theo nhóm điều trị và mô hình tiết kiệm tổn thất thuốc nhờ thuật toán FEFO.',
    kpiTotalPortfolio: 'Tổng Giá Trị Tồn Kho (Bán lẻ)',
    kpiGrossMargin: 'Biên Lợi Nhuận Gộp Dự Kiến',
    kpiCriticalExposure: 'Tồn Kho Rủi Ro Hết Hạn (<30d)',
    kpiFefoSavings: 'Chi Phí Tiết Kiệm Được Nhờ FEFO',
    acquisitionCost: 'Giá Vốn Nhập:',
    estProfit: 'Ước Tính Lợi Nhuận:',
    spoilageReduction: 'Giảm ~72% Hỏng Hóc Tiêu Hủy',
    financialMarginByCategory: 'Biên Lợi Nhuận Tài Chính Theo Nhóm Điều Trị',
    categoryDesc: 'Tổng hợp tiềm năng doanh thu và hiệu quả tỷ suất lợi nhuận',
    colTherapeuticCategory: 'Nhóm Điều Trị Dược Lý',
    colSkus: 'Số SKU',
    colHoldingCost: 'Chi Phí Tồn Kho',
    colProjectedRevenue: 'Doanh Thu Dự Kiến',
    colGrossProfit: 'Lợi Nhuận Gộp',
    impendingLossTitle: 'Ước Tính Thất Thoát Theo Mốc Thời Gian Hạn Dùng',
    lossExposure90Days: 'Tổng Rủi Ro Tiêu Hủy Trong 90 Ngày:',
    queryIndexTitle: 'Kiến Trúc Tối Ưu Hóa Chỉ Mục Cơ Sở Dữ Liệu (Index)',
    queryIndexDesc: 'Đảm bảo truy vấn FEFO và tìm kiếm liên kho đạt tốc độ dưới 10ms trên hơn 1.000.000 bản ghi lô với các chỉ mục B-Tree phối hợp trên PostgreSQL & SQLite:',

    rbacTitle: 'Kiểm Soát Truy Cập Dựa Trên Vai Trò (RBAC) & An Ninh',
    rbacSubtitle: 'Xác thực Token JWT bảo mật kết hợp bộ lọc quyền trên giao diện và tầng API REST FastAPI theo tiêu chuẩn 21 CFR Part 11.',
    permissionMatrixTitle: 'Ma Trận Quyền Hạn & Chắn Lọc Hệ Thống',
    permissionMatrixSubtitle: 'Phân định chi tiết khả năng thao tác của từng chức danh chuyên trách trong chuỗi cung ứng dược',
    activeSession: 'Phiên Đang Chọn',
    switchToPersona: 'Chuyển Sang Vai Trò Này',
    colFeatureRoute: 'Chức Năng / Tuyến Nghiệp Vụ',

    footerCopyright: 'Hệ Thống Quản Trị Dược Phẩm Doanh Nghiệp PharmaTrack ERP',
    footerCompliance: 'Đạt Chứng Nhận 21 CFR Part 11 & cGMP',
    footerBackend: 'FastAPI + PostgreSQL/SQLite',
    footerEngine: 'Động Cơ FEFO Đang Hoạt Động',
  },
};
