import React, { useState, useCallback } from 'react';

const nodes = [
  {
    id: 'config-matrix',
    label: 'Configuration Matrix',
    subtitle: 'Single Source of Truth',
    x: 200,
    y: 580,
    color: '#00D4AA',
    questions: [
      'What sub-assemblies make up each product?',
      'What is the SE/ME/EE/PM configuration?',
      'How many units of each part are allocated?',
    ],
    details: {
      disciplines: ['Systems (SE)', 'Mechanical (ME)', 'Electrical (EE)', 'Program (PM)'],
      capacity: 'Up to 100 products per matrix',
      structure: 'Tabs per discipline • Rows = parts/sub-assy • Columns = systems',
      role: 'Engineers allocate ship-level sub-assemblies and parts to define shippable products',
    },
    icon: 'grid',
  },
  {
    id: 'pm-top-level',
    label: 'PM Top Level',
    subtitle: 'System Definitions',
    x: 200,
    y: 120,
    color: '#FF6B35',
    questions: [
      'What is the system code?',
      'Where does it ship to?',
      'When is installation scheduled?',
    ],
    details: {
      content: ['System Code', 'Ship-to Address', 'Installation Date'],
      role: 'High-level definition of each system in the program',
    },
    icon: 'doc',
  },
  {
    id: 'config-driver',
    label: 'Config Driver',
    subtitle: 'Flattened Aggregation',
    x: 500,
    y: 230,
    color: '#9D4EDD',
    questions: [
      'How many of each part are needed total?',
      'What is the aggregated count per sub-assembly?',
      'What does the flattened BOM look like?',
    ],
    details: {
      source: 'Extracts from Configuration Matrix',
      structure: 'Tab per discipline (SE, ME, EE, PM)',
      content: 'Ship-level sub-assemblies and parts, aggregated',
      process: 'Flattens multi-tab discipline structure into single output',
      role: 'Transforms matrix format into usable flat data for downstream consumption',
    },
    icon: 'transform',
  },
  {
    id: 'config-bom-se',
    label: 'Config BOM - SE',
    subtitle: 'Systems Engineering',
    x: 800,
    y: 140,
    color: '#00B4D8',
    questions: [
      'What SE parts/sub-assy are needed for this project?',
      'What are the SE quantities per system?',
    ],
    details: {
      discipline: 'Systems Engineering (SE)',
      source: 'Manual copy/paste from Config Driver',
      scope: 'Project-specific SE configuration',
    },
    icon: 'bom',
  },
  {
    id: 'config-bom-me',
    label: 'Config BOM - ME',
    subtitle: 'Mechanical Engineering',
    x: 800,
    y: 230,
    color: '#00B4D8',
    questions: [
      'What ME parts/sub-assy are needed for this project?',
      'What are the ME quantities per system?',
    ],
    details: {
      discipline: 'Mechanical Engineering (ME)',
      source: 'Manual copy/paste from Config Driver',
      scope: 'Project-specific ME configuration',
    },
    icon: 'bom',
  },
  {
    id: 'config-bom-ee',
    label: 'Config BOM - EE',
    subtitle: 'Electrical Engineering',
    x: 800,
    y: 320,
    color: '#00B4D8',
    questions: [
      'What EE parts/sub-assy are needed for this project?',
      'What are the EE quantities per system?',
    ],
    details: {
      discipline: 'Electrical Engineering (EE)',
      source: 'Manual copy/paste from Config Driver',
      scope: 'Project-specific EE configuration',
    },
    icon: 'bom',
  },
  {
    id: 'config-bom-pm',
    label: 'Config BOM - PM',
    subtitle: 'Program Management',
    x: 800,
    y: 410,
    color: '#00B4D8',
    questions: [
      'What PM parts/sub-assy are needed for this project?',
      'What are the PM quantities per system?',
    ],
    details: {
      discipline: 'Program Management (PM)',
      source: 'Manual copy/paste from Config Driver',
      scope: 'Project-specific PM configuration',
    },
    icon: 'bom',
  },
  {
    id: 'master-bom',
    label: 'Program Master BOM',
    subtitle: 'Unified Reference',
    x: 1100,
    y: 275,
    color: '#FFD60A',
    questions: [
      'What are all the discipline BOMs for this program?',
      'What part numbers reference each discipline BOM?',
      'What is the complete program structure?',
    ],
    details: {
      structure: 'Same format as discipline BOMs',
      content: 'References to discipline BOMs by part number',
      role: 'Unified view linking all 4 discipline configurations',
      note: 'Contains references, not actual components',
    },
    icon: 'master',
  },
  {
    id: 'irp',
    label: 'IRP',
    subtitle: 'Impact Resource Planner',
    x: 1400,
    y: 400,
    color: '#E63946',
    questions: [
      'What is the full nested BOM for the program?',
      'What are ALL parts and sub-assemblies needed?',
      'What does the flat BOM look like for procurement?',
      'What diff reqs are needed to reconcile counts?',
    ],
    details: {
      technology: 'VBA-powered Excel workbook',
      function: 'Material Requirements Planning (MRP)',
      process: 'Recursively traverses DOC-IA SharePoint server',
      startPoint: 'Program Master BOM',
      internalOutput: 'Flat BOM - aggregated at part level for procurement',
      feedback: 'Receives pricing, receiving status, PR numbers, qty bought from Master Proc Tracker',
      diffReqs: 'Can regenerate diff reqs to reconcile counts',
      role: 'Core MRP engine - compiles full material requirements',
    },
    icon: 'engine',
  },
  {
    id: 'purchase-reqs',
    label: 'Purchase Requisitions',
    subtitle: 'Per-Vendor PRs',
    x: 1400,
    y: 275,
    color: '#06D6A0',
    questions: [
      'What needs to be ordered from each vendor?',
      'What are the part details for procurement?',
      'What is the pricing and delivery info?',
    ],
    details: {
      format: 'Excel workbook (1 per vendor)',
      generation: 'Auto-generated by IRP via VBA',
      preFilled: ['Vendor', 'Project Code (Bulk Order)', 'Part Number', 'Revision', 'Description', 'UoM'],
      manualEntry: ['Pricing', 'Need By Date', 'Ship To Address', 'Cost'],
      role: 'Procurement documents for vendor ordering',
    },
    icon: 'purchase',
  },
  {
    id: 'master-proc-tracker',
    label: 'Master Proc Tracker',
    subtitle: 'Consolidated PR View',
    x: 1700,
    y: 275,
    color: '#118AB2',
    questions: [
      'What is the status of all PRs?',
      'What has been ordered across all vendors?',
      'What is the consolidated procurement picture?',
    ],
    details: {
      format: 'Excel workbook',
      source: 'Reads all applicable PRs via Power Query',
      output: 'Single unified table of all procurement data',
      role: 'Centralized visibility into all purchase requisitions',
    },
    icon: 'tracker',
  },
  {
    id: 'master-receiving',
    label: 'Master Receiving List',
    subtitle: 'Receiving Team Interface',
    x: 1700,
    y: 400,
    color: '#73D2DE',
    questions: [
      'What items are expected to be received?',
      'What has been received and when?',
      'Where was each item received to?',
    ],
    details: {
      format: 'Excel workbook',
      source: 'Power Query from Master Proc Tracker',
      input: 'Exposes PRs for receiving team to receive against',
      output: 'Quantities received, dates, locations',
      relationship: 'Bi-directional with Master Proc Tracker',
      role: 'Receiving team records receipt of purchased materials',
    },
    icon: 'receiving',
  },
  {
    id: 'procurement',
    label: 'Procurement',
    subtitle: 'Purchasing Team',
    x: 1400,
    y: 150,
    color: '#F4A261',
    questions: [
      'What PRs are pending approval?',
      'What quotes have been received?',
      'What orders need to be placed?',
    ],
    details: {
      receives: 'PR + Quote via email',
      role: 'Reviews and processes purchase requisitions',
      action: 'Places orders with vendors',
    },
    icon: 'team',
  },
  {
    id: 'acumatica',
    label: 'Acumatica',
    subtitle: 'ERP System',
    x: 1400,
    y: 25,
    color: '#8338EC',
    questions: [
      'What is the financial status of orders?',
      'What are the official purchase orders?',
      'What is the accounting record?',
    ],
    details: {
      type: 'Enterprise Resource Planning (ERP)',
      role: 'Official system of record for purchasing and accounting',
    },
    icon: 'erp',
  },
  {
    id: 'vendor-cadence',
    label: 'Vendor Cadence',
    subtitle: 'Weekly Vendor Tracking',
    x: -100,
    y: 230,
    color: '#E9C46A',
    questions: [
      'What line items does each vendor need to provide?',
      'When does each system need to ship?',
      'What is the status update from each vendor?',
      'What are the weekly meeting notes?',
    ],
    details: {
      format: 'Excel workbook with VBA',
      structure: 'Tab per top-level vendor (Intralox, Roach, Flow Turn, Apple Automation, etc.)',
      content: 'All line items per vendor, per finger',
      calculation: 'Required ship date based on install start and vendor distance to site',
      usage: 'Weekly meeting notes and vendor status updates',
      export: 'VBA-generated reports to share with vendors',
      sources: ['Configuration Matrix', 'PM Top Level'],
    },
    icon: 'calendar',
  },
  {
    id: 'vendor-shipping-schedule',
    label: 'Vendor Shipping Schedule',
    subtitle: 'Individual Vendor View',
    x: -400,
    y: 120,
    color: '#2A9D8F',
    questions: [
      'What is the shipping schedule for this vendor?',
      'Are we aligned with the vendor on dates?',
      'What items ship when?',
    ],
    details: {
      format: 'Excel report (VBA generated)',
      purpose: 'Individual vendor view to ensure alignment throughout the program',
      audience: 'External - shared with vendors',
    },
    icon: 'doc',
  },
  {
    id: 'internal-high-level-schedule',
    label: 'Internal High Level Schedule',
    subtitle: 'ADTA Team Communication',
    x: -400,
    y: 230,
    color: '#2A9D8F',
    questions: [
      'What date changes have occurred?',
      'What is the current schedule status?',
      'What does the team need to know?',
    ],
    details: {
      format: 'Excel report (VBA generated)',
      purpose: 'Internal communication of date changes',
      updates: 'Ad-hoc for every change',
      audience: 'Internal - whole ADTA team',
    },
    icon: 'doc',
  },
  {
    id: 'logistics-pickup-schedule',
    label: 'Logistics Pickup Schedule',
    subtitle: 'Truck Scheduling',
    x: -400,
    y: 340,
    color: '#2A9D8F',
    questions: [
      'What truck pickups need to be scheduled?',
      'When and where are pickups?',
      'What is the ship-to address?',
    ],
    details: {
      format: 'Excel report (VBA generated)',
      content: 'Table with pickup scheduling details',
      fields: ['Pickup date', 'Pickup location', 'Ship-to address'],
      audience: 'Internal - logistics coordination',
    },
    icon: 'doc',
  },
  {
    id: 'bom-cost',
    label: 'BOM Cost',
    subtitle: 'Ship-Level Cost Rollup',
    x: 1100,
    y: 580,
    color: '#F72585',
    questions: [
      'What is the total cost per ship-level item?',
      'What is the cost breakdown of assemblies?',
      'What is the avg price per individual part?',
    ],
    details: {
      format: 'Excel workbook',
      sources: ['Configuration Matrix', 'IRP'],
      process: 'Rolls up cost of every ship-level item',
      irpData: ['BOM explosion (drill-down of parts behind assemblies)', 'Calculated avg price per individual item'],
      role: 'Complete cost visibility at ship-level',
    },
    icon: 'cost',
  },
  {
    id: 'material-reconciliation',
    label: 'Material Reconciliation',
    subtitle: 'As-Sold vs As-Built',
    x: 1100,
    y: 720,
    color: '#7209B7',
    questions: [
      'What are the BOM differences between as-sold and as-built?',
      'What is the quantity delta per item?',
      'What is the dollar amount of the gap?',
      'What change orders are needed for the customer?',
    ],
    details: {
      format: 'Excel workbook',
      sources: ['Configuration Matrix', 'BOM Cost'],
      comparison: 'As-Sold (Config Matrix) vs As-Built',
      output: 'Quantified deltas (count and $ amount)',
      deltaRange: 'Can be positive or negative',
      usage: 'Generates change orders to end customer',
      role: 'Financial reconciliation of configuration changes',
    },
    icon: 'reconcile',
  },
  {
    id: 'asset-tag-master',
    label: 'Asset Tag Master',
    subtitle: 'Tag Generation & Tracking',
    x: 200,
    y: 720,
    color: '#4895EF',
    questions: [
      'What assets need to receive a tag?',
      'What are the specific line items per finger?',
      'What notes/inputs have been added?',
      'What tags need to be ordered from the print shop?',
    ],
    details: {
      format: 'Excel workbook',
      source: 'Configuration Matrix',
      content: 'Specific line items per finger requiring asset tags',
      workflow: 'Engineers specify in Config Matrix → Users enhance with manual notes/inputs',
      output: 'Tag orders for printing shop',
      role: 'Asset tagging coordination and procurement',
    },
    icon: 'tag',
  },
  {
    id: 'material-list-generator',
    label: 'Material List Generator',
    subtitle: 'Finger Packing Lists',
    x: -100,
    y: 580,
    color: '#06D6A0',
    questions: [
      'What ship-level materials are needed for each finger?',
      'What is the packing list for a specific finger?',
      'What materials need to be staged?',
    ],
    details: {
      format: 'Excel workbook with VBA',
      source: 'Configuration Matrix',
      process: 'Aggregates all ship-level materials per finger',
      output: 'Dedicated material list per finger (VBA generated)',
      usage: 'Shop personnel use lists to pack and stage each finger with appropriate configuration',
      role: 'Shop floor packing and staging coordination',
    },
    icon: 'doc',
  },
  {
    id: 'finger-material-list',
    label: 'Finger Material List',
    subtitle: 'Per-Finger Packing List',
    x: -400,
    y: 580,
    color: '#2A9D8F',
    questions: [
      'What materials are needed for this finger?',
      'What are the top-level items?',
      'What electrical/mechanical/documentation is required?',
    ],
    details: {
      format: 'Excel workbook (VBA generated)',
      source: 'Material List Generator',
      structure: 'Tab per discipline: Top Level, Electrical, Mechanical, Documentation',
      content: 'Clean list of all ship-level materials for a specific finger',
      usage: 'Shop personnel packing and staging reference',
    },
    icon: 'doc',
  },
  {
    id: 'work-orders-pick-list',
    label: 'Work Orders & Pick List',
    subtitle: 'Assembly Release',
    x: 1100,
    y: 860,
    color: '#F4A261',
    questions: [
      'What work orders need to be released?',
      'What parts need to be picked for each work order?',
      'What assemblies are required?',
    ],
    details: {
      format: 'Excel workbook',
      sources: ['Configuration Matrix', 'IRP'],
      process: 'Combines ship-level item counts with IRP BOM explosion',
      output: 'Work orders with associated pick lists',
      usage: 'Release work orders and coordinate parts picking',
      role: 'Production planning and shop floor coordination',
    },
    icon: 'tracker',
  },
];

// Calculate the bounds of all nodes to determine the default pan position
// Node rendering offsets: x: -100 (node rect starts 100px left of node.x), y: -40 (starts 40px above node.y)
const NODE_OFFSET_X = -100;
const NODE_OFFSET_Y = -40;

function getCanvasBounds(nodesList) {
  if (nodesList.length === 0) return { minX: 0, minY: 0 };

  const minX = Math.min(...nodesList.map(n => n.x + NODE_OFFSET_X));
  const minY = Math.min(...nodesList.map(n => n.y + NODE_OFFSET_Y));

  return { minX, minY };
}

// Calculate default pan to position top-left of canvas content just below the title
// Target screen position: x: 30 (left margin), y: 110 (below title)
const INITIAL_SCREEN_X = 30;
const INITIAL_SCREEN_Y = 110;

function getDefaultPan(nodesList) {
  const { minX, minY } = getCanvasBounds(nodesList);
  return {
    x: INITIAL_SCREEN_X - minX,
    y: INITIAL_SCREEN_Y - minY,
  };
}

// Container definition for DOC-IA
const containers = [
  {
    id: 'doc-ia',
    label: 'DOC-IA',
    subtitle: 'SharePoint BOM Server',
    x: 680,
    y: 90,
    width: 550,
    height: 370,
    color: '#7B8794',
    contains: ['config-bom-se', 'config-bom-me', 'config-bom-ee', 'config-bom-pm', 'master-bom'],
  },
];

const connections = [
  {
    from: 'config-matrix',
    to: 'pm-top-level',
    label: 'Power Query',
    description: 'System definitions flow to configuration',
  },
  {
    from: 'config-matrix',
    to: 'config-driver',
    label: 'Power Query',
    description: 'Extracts and flattens discipline data',
    fromSide: 'top',
    toSide: 'left',
  },
  {
    from: 'config-driver',
    to: 'config-bom-se',
    label: 'Manual',
    description: 'Copy/paste SE discipline data',
  },
  {
    from: 'config-driver',
    to: 'config-bom-me',
    label: 'Manual',
    description: 'Copy/paste ME discipline data',
  },
  {
    from: 'config-driver',
    to: 'config-bom-ee',
    label: 'Manual',
    description: 'Copy/paste EE discipline data',
  },
  {
    from: 'config-driver',
    to: 'config-bom-pm',
    label: 'Manual',
    description: 'Copy/paste PM discipline data',
  },
  {
    from: 'config-bom-se',
    to: 'master-bom',
    label: 'Reference',
    description: 'SE BOM referenced by part number',
  },
  {
    from: 'config-bom-me',
    to: 'master-bom',
    label: 'Reference',
    description: 'ME BOM referenced by part number',
  },
  {
    from: 'config-bom-ee',
    to: 'master-bom',
    label: 'Reference',
    description: 'EE BOM referenced by part number',
  },
  {
    from: 'config-bom-pm',
    to: 'master-bom',
    label: 'Reference',
    description: 'PM BOM referenced by part number',
  },
  {
    from: 'master-bom',
    to: 'irp',
    label: 'Recursive Read',
    description: 'IRP recursively traverses all BOMs starting here',
  },
  {
    from: 'irp',
    to: 'purchase-reqs',
    label: 'VBA Generate',
    description: 'Auto-generates PRs per vendor',
  },
  {
    from: 'purchase-reqs',
    to: 'procurement',
    label: 'Email + Quote',
    description: 'User manually sends PR with attached quote',
    fromSide: 'top',
    toSide: 'bottom',
  },
  {
    from: 'purchase-reqs',
    to: 'master-proc-tracker',
    label: 'Power Query',
    description: 'Reads all PRs into unified table',
  },
  {
    from: 'master-proc-tracker',
    to: 'master-receiving',
    label: 'Power Query',
    description: 'Exposes PRs for receiving',
    fromSide: 'bottom',
    toSide: 'top',
  },
  {
    from: 'master-receiving',
    to: 'master-proc-tracker',
    label: 'Power Query',
    description: 'Feeds back qty received, dates, locations',
    fromSide: 'top',
    toSide: 'bottom',
  },
  {
    from: 'master-proc-tracker',
    to: 'irp',
    label: 'Power Query',
    description: 'Pricing, receiving status, PR numbers, qty bought',
  },
  {
    from: 'procurement',
    to: 'acumatica',
    label: 'Manual Entry',
    description: 'Procurement manually enters POs into ERP',
    fromSide: 'top',
    toSide: 'bottom',
  },
  {
    from: 'master-receiving',
    to: 'irp',
    label: 'Power Query',
    description: 'Receiving data feeds into IRP',
    fromSide: 'left',
    toSide: 'right',
  },
  {
    from: 'config-matrix',
    to: 'vendor-cadence',
    label: 'Power Query',
    description: 'Configuration data for vendor line items',
    fromSide: 'top',
    toSide: 'right',
  },
  {
    from: 'pm-top-level',
    to: 'vendor-cadence',
    label: 'Power Query',
    description: 'System definitions and install dates',
    fromSide: 'left',
    toSide: 'right',
  },
  {
    from: 'vendor-cadence',
    to: 'vendor-shipping-schedule',
    label: 'VBA Generate',
    description: 'Generates individual vendor shipping schedules',
  },
  {
    from: 'vendor-cadence',
    to: 'internal-high-level-schedule',
    label: 'VBA Generate',
    description: 'Generates internal schedule communication',
  },
  {
    from: 'vendor-cadence',
    to: 'logistics-pickup-schedule',
    label: 'VBA Generate',
    description: 'Generates logistics pickup scheduling table',
  },
  {
    from: 'config-matrix',
    to: 'bom-cost',
    label: 'Power Query',
    description: 'Ship-level item definitions',
  },
  {
    from: 'irp',
    to: 'bom-cost',
    label: 'Power Query',
    description: 'BOM explosion and avg price per item',
  },
  {
    from: 'config-matrix',
    to: 'material-reconciliation',
    label: 'Power Query',
    description: 'As-sold configuration data',
  },
  {
    from: 'bom-cost',
    to: 'material-reconciliation',
    label: 'Power Query',
    description: 'Cost data for delta calculations',
  },
  {
    from: 'config-matrix',
    to: 'asset-tag-master',
    label: 'Power Query',
    description: 'Line items requiring asset tags',
  },
  {
    from: 'config-matrix',
    to: 'material-list-generator',
    label: 'Power Query',
    description: 'Ship-level materials per finger',
  },
  {
    from: 'material-list-generator',
    to: 'finger-material-list',
    label: 'VBA Generate',
    description: 'Generates per-finger material lists',
  },
  {
    from: 'config-matrix',
    to: 'work-orders-pick-list',
    label: 'Manual',
    description: 'Ship-level item counts',
  },
  {
    from: 'irp',
    to: 'work-orders-pick-list',
    label: 'Manual',
    description: 'BOM explosion for pick lists',
    fromSide: 'bottom',
    toSide: 'right',
  },
];

const GridIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
  </svg>
);

const DocIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14,2 14,8 20,8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const TransformIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2">
    <rect x="2" y="6" width="6" height="12" rx="1" />
    <rect x="16" y="6" width="6" height="12" rx="1" />
    <path d="M8 12h2l2-3 2 6 2-3h2" />
  </svg>
);

const BomIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="3" y1="15" x2="21" y2="15" />
    <line x1="9" y1="3" x2="9" y2="21" />
  </svg>
);

const MasterIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2">
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="4" />
    <line x1="12" y1="3" x2="12" y2="8" />
    <line x1="12" y1="16" x2="12" y2="21" />
    <line x1="3" y1="12" x2="8" y2="12" />
    <line x1="16" y1="12" x2="21" y2="12" />
  </svg>
);

const ServerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2">
    <rect x="2" y="2" width="20" height="8" rx="2" />
    <rect x="2" y="14" width="20" height="8" rx="2" />
    <line x1="6" y1="6" x2="6.01" y2="6" strokeWidth="3" strokeLinecap="round" />
    <line x1="6" y1="18" x2="6.01" y2="18" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const EngineIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
  </svg>
);

const PurchaseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const TeamIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const TrackerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="9" y1="21" x2="9" y2="9" />
    <polyline points="13 15 15 17 19 13" />
  </svg>
);

const ReceivingIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const ErpIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2">
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
    <path d="M6 8h.01M6 11h.01M9 8h6M9 11h6" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
  </svg>
);

const CostIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const ReconcileIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2">
    <path d="M16 3h5v5" />
    <path d="M8 21H3v-5" />
    <path d="M21 3l-9 9" />
    <path d="M3 21l9-9" />
  </svg>
);

const TagIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

const Container = ({ container }) => {
  return (
    <g>
      {/* Container background */}
      <rect
        x={container.x}
        y={container.y}
        width={container.width}
        height={container.height}
        rx="12"
        fill="#0d0d1a"
        stroke={container.color}
        strokeWidth="2"
        strokeDasharray="8 4"
        opacity="0.6"
      />

      {/* Container label background */}
      <rect
        x={container.x + 15}
        y={container.y - 12}
        width="200"
        height="24"
        rx="4"
        fill="#0d0d1a"
      />

      {/* Server icon */}
      <g transform={`translate(${container.x + 20}, ${container.y - 8})`} stroke={container.color} fill="none" strokeWidth="1.5">
        <rect x="0" y="0" width="14" height="6" rx="1" />
        <rect x="0" y="9" width="14" height="6" rx="1" />
        <circle cx="3" cy="3" r="1" fill={container.color} />
        <circle cx="3" cy="12" r="1" fill={container.color} />
      </g>

      {/* Container label */}
      <text
        x={container.x + 40}
        y={container.y + 2}
        fill={container.color}
        fontSize="12"
        fontWeight="600"
        fontFamily="'JetBrains Mono', 'SF Mono', monospace"
      >
        {container.label}
      </text>

      {/* Container subtitle */}
      <text
        x={container.x + 100}
        y={container.y + 2}
        fill="#555"
        fontSize="10"
        fontFamily="'JetBrains Mono', 'SF Mono', monospace"
      >
        {container.subtitle}
      </text>
    </g>
  );
};

const getIcon = (type) => {
  switch (type) {
    case 'grid': return <GridIcon />;
    case 'doc': return <DocIcon />;
    case 'transform': return <TransformIcon />;
    case 'bom': return <BomIcon />;
    case 'master': return <MasterIcon />;
    case 'server': return <ServerIcon />;
    case 'engine': return <EngineIcon />;
    case 'purchase': return <PurchaseIcon />;
    case 'team': return <TeamIcon />;
    case 'tracker': return <TrackerIcon />;
    case 'receiving': return <ReceivingIcon />;
    case 'erp': return <ErpIcon />;
    case 'calendar': return <CalendarIcon />;
    case 'cost': return <CostIcon />;
    case 'reconcile': return <ReconcileIcon />;
    case 'tag': return <TagIcon />;
    default: return <GridIcon />;
  }
};

const Node = ({ node, isSelected, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Split label into two lines if too long
  const maxCharsPerLine = 18;
  let labelLines = [node.label];
  if (node.label.length > maxCharsPerLine) {
    const words = node.label.split(' ');
    let line1 = '';
    let line2 = '';
    for (const word of words) {
      if ((line1 + ' ' + word).trim().length <= maxCharsPerLine) {
        line1 = (line1 + ' ' + word).trim();
      } else {
        line2 = (line2 + ' ' + word).trim();
      }
    }
    labelLines = [line1, line2].filter(l => l);
  }

  return (
    <g
      transform={`translate(${node.x}, ${node.y})`}
      onClick={() => onClick(node.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ cursor: 'pointer' }}
    >
      {/* Glow effect */}
      {(isSelected || isHovered) && (
        <rect
          x="-110"
          y="-45"
          width="220"
          height="90"
          rx="8"
          fill={node.color}
          opacity="0.15"
          style={{
            filter: 'blur(15px)',
          }}
        />
      )}

      {/* Node background */}
      <rect
        x="-100"
        y="-40"
        width="200"
        height="80"
        rx="6"
        fill="#1a1a2e"
        stroke={isSelected ? node.color : isHovered ? node.color : '#2d2d44'}
        strokeWidth={isSelected ? 2 : 1}
        style={{
          transition: 'all 0.2s ease',
        }}
      />

      {/* Color accent bar */}
      <rect
        x="-100"
        y="-40"
        width="6"
        height="80"
        rx="6"
        fill={node.color}
        clipPath="inset(0 0 0 0 round 6px 0 0 6px)"
      />
      <rect
        x="-100"
        y="-40"
        width="6"
        height="80"
        fill={node.color}
      />

      {/* Icon */}
      <g transform="translate(-80, -12)" fill="none" stroke="#ffffff">
        {getIcon(node.icon)}
      </g>

      {/* Label - supports 2 lines */}
      {labelLines.length === 1 ? (
        <text
          x="-45"
          y="-8"
          fill="#ffffff"
          fontSize="14"
          fontWeight="600"
          fontFamily="'JetBrains Mono', 'SF Mono', monospace"
        >
          {labelLines[0]}
        </text>
      ) : (
        <>
          <text
            x="-45"
            y="-14"
            fill="#ffffff"
            fontSize="13"
            fontWeight="600"
            fontFamily="'JetBrains Mono', 'SF Mono', monospace"
          >
            {labelLines[0]}
          </text>
          <text
            x="-45"
            y="2"
            fill="#ffffff"
            fontSize="13"
            fontWeight="600"
            fontFamily="'JetBrains Mono', 'SF Mono', monospace"
          >
            {labelLines[1]}
          </text>
        </>
      )}

      {/* Subtitle */}
      <text
        x="-45"
        y={labelLines.length === 1 ? 12 : 20}
        fill="#888899"
        fontSize="11"
        fontFamily="'JetBrains Mono', 'SF Mono', monospace"
      >
        {node.subtitle}
      </text>
    </g>
  );
};

const Connection = ({ from, to, label, fromSide, toSide, nodes }) => {
  const fromNode = nodes.find(n => n.id === from);
  const toNode = nodes.find(n => n.id === to);

  if (!fromNode || !toNode) return null;

  const isManual = label === 'Manual';
  const isReference = label === 'Reference';
  const isStoredIn = label === 'Stored In';
  const isRecursive = label === 'Recursive Read';
  const isStartPoint = label === 'Start Point';
  const isVBAGenerate = label === 'VBA Generate';
  const isEmail = label === 'Email + Quote';
  const isManualEntry = label === 'Manual Entry';

  let strokeColor = '#06D6A0';
  let labelColor = '#06D6A0';

  if (isManual) { strokeColor = '#FF6B9D'; labelColor = '#FF6B9D'; }
  else if (isReference) { strokeColor = '#FFD60A'; labelColor = '#FFD60A'; }
  else if (isStoredIn) { strokeColor = '#7B8794'; labelColor = '#7B8794'; }
  else if (isRecursive) { strokeColor = '#E63946'; labelColor = '#E63946'; }
  else if (isStartPoint) { strokeColor = '#E63946'; labelColor = '#E63946'; }
  else if (isVBAGenerate) { strokeColor = '#8888aa'; labelColor = '#8888aa'; }
  else if (isEmail) { strokeColor = '#F4A261'; labelColor = '#F4A261'; }
  else if (isManualEntry) { strokeColor = '#FF6B9D'; labelColor = '#FF6B9D'; }

  // Helper to get attachment point coordinates
  const getAttachmentPoint = (node, side) => {
    switch (side) {
      case 'top': return { x: node.x, y: node.y - 40 };
      case 'bottom': return { x: node.x, y: node.y + 40 };
      case 'left': return { x: node.x - 100, y: node.y };
      case 'right': return { x: node.x + 100, y: node.y };
      default: return { x: node.x, y: node.y };
    }
  };

  let startX, startY, endX, endY;

  // Use manual attachment points if provided, otherwise auto-detect
  if (fromSide && toSide) {
    const startPoint = getAttachmentPoint(fromNode, fromSide);
    const endPoint = getAttachmentPoint(toNode, toSide);
    startX = startPoint.x;
    startY = startPoint.y;
    endX = endPoint.x;
    endY = endPoint.y;
  } else {
    // Auto-detect based on relative positions
    const isHorizontal = Math.abs(toNode.x - fromNode.x) > Math.abs(toNode.y - fromNode.y);
    const isRight = toNode.x > fromNode.x;

    if (isHorizontal) {
      startX = fromNode.x + (isRight ? 100 : -100);
      startY = fromNode.y;
      endX = toNode.x + (isRight ? -100 : 100);
      endY = toNode.y;
    } else {
      startX = fromNode.x;
      startY = fromNode.y + 40;
      endX = toNode.x;
      endY = toNode.y - 40;
    }
  }

  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;

  return (
    <g>
      {/* Connection line */}
      <path
        d={`M ${startX} ${startY}
            C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeDasharray={isManual ? "3 3" : "6 4"}
        style={{
          animation: 'flowDash 1s linear infinite',
        }}
      />
    </g>
  );
};

const DetailPanel = ({ node, onClose }) => {
  if (!node) return null;

  return (
    <div style={{
      position: 'absolute',
      right: '20px',
      top: '20px',
      width: '320px',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16162a 100%)',
      border: `1px solid ${node.color}40`,
      borderRadius: '8px',
      padding: '20px',
      fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
      boxShadow: `0 0 40px ${node.color}15`,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        paddingBottom: '16px',
        borderBottom: '1px solid #2d2d44',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: `${node.color}20`,
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: node.color,
          }}>
            {getIcon(node.icon)}
          </div>
          <div>
            <div style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>
              {node.label}
            </div>
            <div style={{ color: '#666', fontSize: '11px' }}>
              {node.subtitle}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#666',
            cursor: 'pointer',
            fontSize: '18px',
            padding: '4px',
          }}
        >
          ×
        </button>
      </div>

      {/* Questions section */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          color: node.color,
          fontSize: '10px',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginBottom: '10px',
        }}>
          Questions Answered
        </div>
        {node.questions.map((q, i) => (
          <div
            key={i}
            style={{
              color: '#ccc',
              fontSize: '12px',
              padding: '8px 0',
              borderBottom: '1px solid #2d2d4420',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
            }}
          >
            <span style={{ color: node.color }}>→</span>
            {q}
          </div>
        ))}
      </div>

      {/* Details section */}
      <div>
        <div style={{
          color: node.color,
          fontSize: '10px',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginBottom: '10px',
        }}>
          Details
        </div>
        {Object.entries(node.details).map(([key, value]) => (
          <div key={key} style={{ marginBottom: '12px' }}>
            <div style={{
              color: '#666',
              fontSize: '10px',
              textTransform: 'uppercase',
              marginBottom: '4px',
            }}>
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </div>
            <div style={{ color: '#aaa', fontSize: '12px' }}>
              {Array.isArray(value) ? value.join(' • ') : value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function AutomationOSDiagram() {
  const [selectedNode, setSelectedNode] = useState(null);
  // Calculate default pan dynamically based on node positions
  const defaultPan = getDefaultPan(nodes);
  const [pan, setPan] = useState(defaultPan);
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  const handleNodeClick = useCallback((nodeId) => {
    setSelectedNode(prev => prev === nodeId ? null : nodeId);
  }, []);

  const handleMouseDown = useCallback((e) => {
    // Only pan if clicking on the SVG background, not on nodes
    if (e.target.tagName === 'svg' || e.target.tagName === 'rect' && e.target.getAttribute('fill') === 'url(#grid)') {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan]);

  const handleMouseMove = useCallback((e) => {
    if (isPanning) {
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y
      });
    }
  }, [isPanning, startPan]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.min(Math.max(prev + delta, 0.3), 3));
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.2, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.2, 0.3));
  }, []);

  const handleResetView = useCallback(() => {
    setPan(defaultPan);
    setZoom(1);
  }, []);

  const selectedNodeData = nodes.find(n => n.id === selectedNode);

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      background: 'linear-gradient(180deg, #0d0d1a 0%, #0a0a14 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background grid */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0.3,
        }}
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1a1a2e" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Title */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
        zIndex: 20,
        pointerEvents: 'none',
      }}>
        <div style={{
          fontSize: '10px',
          color: '#00D4AA',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          marginBottom: '4px',
        }}>
          Impact Automation
        </div>
        <div style={{
          fontSize: '24px',
          color: '#ffffff',
          fontWeight: '700',
        }}>
          ADTA Operating System Architecture
        </div>
        <div style={{
          fontSize: '12px',
          color: '#666',
          marginTop: '8px',
        }}>
          Click on a node to view details • Drag to pan • Scroll to zoom
        </div>
      </div>

      {/* Zoom Controls */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
        zIndex: 10,
      }}>
        <button
          onClick={handleZoomIn}
          style={{
            width: '36px',
            height: '36px',
            background: '#1a1a2e',
            border: '1px solid #3d3d5c',
            borderRadius: '6px',
            color: '#fff',
            fontSize: '18px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          +
        </button>
        <div style={{
          textAlign: 'center',
          color: '#666',
          fontSize: '10px',
        }}>
          {Math.round(zoom * 100)}%
        </div>
        <button
          onClick={handleZoomOut}
          style={{
            width: '36px',
            height: '36px',
            background: '#1a1a2e',
            border: '1px solid #3d3d5c',
            borderRadius: '6px',
            color: '#fff',
            fontSize: '18px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          −
        </button>
        <button
          onClick={handleResetView}
          style={{
            width: '36px',
            height: '36px',
            background: '#1a1a2e',
            border: '1px solid #3d3d5c',
            borderRadius: '6px',
            color: '#666',
            fontSize: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '4px',
          }}
        >
          ⟲
        </button>
      </div>

      {/* Main diagram */}
      <svg
        width="100%"
        height="100%"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          cursor: isPanning ? 'grabbing' : 'grab'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
      >
        <style>
          {`
            @keyframes flowDash {
              to {
                stroke-dashoffset: -10;
              }
            }
          `}
        </style>

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Containers (render first, behind everything) */}
          {containers.map(container => (
            <Container key={container.id} container={container} />
          ))}

          {/* Connections */}
          {connections.map((conn, i) => (
            <Connection
              key={i}
              from={conn.from}
              to={conn.to}
              label={conn.label}
              fromSide={conn.fromSide}
              toSide={conn.toSide}
              nodes={nodes}
            />
          ))}

          {/* Nodes */}
          {nodes.map(node => (
            <Node
              key={node.id}
              node={node}
              isSelected={selectedNode === node.id}
              onClick={handleNodeClick}
            />
          ))}
        </g>
      </svg>

      {/* Legend */}
      <div style={{
        position: 'absolute',
        bottom: '0',
        left: '0',
        right: '0',
        display: 'flex',
        justifyContent: 'center',
        gap: '32px',
        padding: '8px 20px',
        background: 'rgba(13, 13, 26, 0.95)',
        borderTop: '1px solid #3d3d5c',
        fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
        fontSize: '11px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="24" height="2">
            <line x1="0" y1="1" x2="24" y2="1" stroke="#06D6A0" strokeWidth="2" strokeDasharray="6 4" />
          </svg>
          <span style={{ color: '#06D6A0' }}>Power Query</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="24" height="2">
            <line x1="0" y1="1" x2="24" y2="1" stroke="#FF6B9D" strokeWidth="2" strokeDasharray="3 3" />
          </svg>
          <span style={{ color: '#FF6B9D' }}>Manual</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="24" height="2">
            <line x1="0" y1="1" x2="24" y2="1" stroke="#FFD60A" strokeWidth="2" strokeDasharray="6 4" />
          </svg>
          <span style={{ color: '#FFD60A' }}>Reference</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="24" height="2">
            <line x1="0" y1="1" x2="24" y2="1" stroke="#8888aa" strokeWidth="2" strokeDasharray="6 4" />
          </svg>
          <span style={{ color: '#8888aa' }}>VBA Generate</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="24" height="2">
            <line x1="0" y1="1" x2="24" y2="1" stroke="#E63946" strokeWidth="2" strokeDasharray="6 4" />
          </svg>
          <span style={{ color: '#E63946' }}>Recursive Read</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="24" height="2">
            <line x1="0" y1="1" x2="24" y2="1" stroke="#F4A261" strokeWidth="2" strokeDasharray="6 4" />
          </svg>
          <span style={{ color: '#F4A261' }}>Email + Quote</span>
        </div>
      </div>

      {/* Detail panel */}
      <DetailPanel
        node={selectedNodeData}
        onClose={() => setSelectedNode(null)}
      />
    </div>
  );
}
