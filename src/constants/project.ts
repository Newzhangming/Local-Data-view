export interface ProjectDetailDto {
  id: string;
  proj_no: string;
  proj_name: string;
  data_level: string;
  proj_type: string;
  proj_use: string;
  region: string;
  address: string;
  scale_desc: string;
  total_area: number;
  updated_at: Date;
  source_id: string;
  manager: ManagerBase;
  managers: [{ manager: ManagerBase }];
  contract: ProjContract;
  contracts: ProjContract[];
  proj_units: ProjUnit[];
  companies: AcceptanceFilingCompany[];
  winning_bidder: WinningBidder[];
  construction_permits: ConstructionPermit[];
  acceptance_filings: AcceptanceFiling[];
  completion_acceptances: CompletionAcceptance[];
  proj_tech_kpis: ProjectTechKpi[];
  mgr_tech_kpis: ManagerTechKpi[];
  data_from: string;
  conclusion: string;
  remark: string;

  // UI 只能命名为 labels
  labels?: ProjUnit[];
}

export interface ProjectReqDto {
  proj_no: string;
  proj_name: string;
  data_level: string;
  proj_type: string;
  total_area: number;
  conclusion?: string;
}

export interface AcceptanceFiling {
  id: string;
  label: string;
  data_level: string;
  actual_area: number;
  actual_cost: number;
  proj_start_date: Date;
  af_date?: Date;
  af_no?: string;
  cp_no: string;
  companies: AcceptanceFilingCompany[];
  project: { managers: [{ manager_id: string }] };
  managers: { manager: ManagerBase }[];
  ca_date?: Date;
  data_from: string;
  scale_desc: string;
  structure: string;
  span: number;
}

export interface CompletionAcceptance {
  id: string;
  label: string;
  proj_start_date: Date;
  ca_date: Date;
  data_level: string;
  actual_area: number;
  actual_cost: number;
  cp_date: Date;
  cp_no: string;
}

export interface AcceptanceFilingCompany {
  company: CompanyCompany;
}

export interface CompanyCompany {
  id: string;
  name: string;
  role_type: string;
  social_credit_code: string;
  managers?: ManagerElement[];
}

export interface ManagerElement {
  manager?: ManagerManager;
  label?: string;
  manager_id?: string;
  company_id?: string;
  assigned_at?: Date;
}

export interface ManagerBase {
  id: string;
  id_card: string;
  name: string;
}

export interface ManagerManager extends ManagerBase {
  companies?: ManagerCompany[];
}

export interface ManagerCompany {
  label: string;
  manager_id: string;
  company_id: string;
  assigned_at: Date;
}

export interface ConstructionPermit {
  id: string;
  label: string;
  data_level: string;
  cp_no: string;
  cp_date: Date;
  cp_amount: number;
  cp_area: number;
  company: CompanyCompany;
  manager: ManagerManager;
  managers: { manager: ManagerBase }[];
  data_from: string;
  scale_desc: string;
  span: number;
}

export interface ProjContract {
  sign_date: Date;
  data_level: string;
  cont_no: string;
  company: { id: true; name: string };
  data_from: string;
}

export interface ProjUnit {
  unit_no: string;
  unit_name: string;
  unit_area: number;
  unit_cost: number;
  height: number;
}

export interface WinningBidder {
  id: string;
  label: string;
  data_level: string;
  company: CompanyCompany;
  tender_type: string;
  wb_no: string;
  wb_amount: number;
  wb_date: Date;
  manager: ManagerManager;
  data_from: string;
  scale_desc: string;
}

export interface ProjectTechKpi {
  id: string;
  data_level: string;
  kpi_no: string;
  kpi_type: string;
  company: CompanyCompany;
  start_date: Date;
  end_date: Date;
  kpi_desc: string;
}

export interface ManagerTechKpi {
  proj_role: string;
  manager: ManagerBase;
}

export type PerformanceType = {
  proj_name: string;
  proj_no: string;
  total_area: number;
  data_level: string;
  managers: {
    manager: {
      name: string;
      certs: { company: { name: string }; experiences: { start_date: string; end_date: string }[] }[];
    };
  }[];
  construction_permits: { cp_date: string }[];
  acceptance_filings: {
    actual_area: number;
    data_level: string;
    managers: { manager: { name: string } }[];
    companies: { company: { name: string } }[];
    proj_start_date: string;
    af_date: string;
  }[];
};
