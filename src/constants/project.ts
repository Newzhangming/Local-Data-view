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
  created_at: Date;
  contract: {
    sign_date: Date;
    data_level: string;
    cont_no: string;
    company: { id: true; name: string };
  };
  proj_units: ProjUnit[];
  companies: AcceptanceFilingCompany[];
  winning_bidder: WinningBidder[];
  construction_permits: ConstructionPermit[];
  acceptance_filings: AcceptanceFiling[];
  completion_acceptances: CompletionAcceptance[];
}

export interface ProjectReqDto {
  proj_no: string;
  proj_name: string;
  data_level: string;
  proj_type: string;
  total_area: number;
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
  ca_date?: Date;
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

export interface ManagerManager {
  id: string;
  id_card: string;
  name: string;
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
}

export interface ProjUnit {
  label: string;
  unit_no: string;
  unit_name: string;
  unit_area: number;
  unit_cost: number;
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
}
