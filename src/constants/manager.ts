export interface ManagerUpdateReq {
  id: string;
  name: string;
  id_card: string;
  cert_name?: string;
  cert_status?: string;
}

export interface CertDto {
  id: string;
  cert_name: string;
  lending_no: string;
  major: string;
  valid_date: string;
  company: Company;
  experiences: Experience[];
  major_2: string;
  valid_date_2: string;
  major_3: string;
  valid_date_3: string;
}

export interface ManagerDto {
  id: string;
  name: string;
  gender: string;
  id_card: string;
  cert_name: string;
  lending_no: string;
  lending_to: string;
  source_id: string;
  cert_status: string;
  proj_count: number;
  tech_kpi_count: number;
  certs: CertDto[];
  projects: ProjectDto[];
  mgr_tech_kpis: { id: string }[];
  experiences: Experience[];
  created_at: Date;
  updated_at: Date;
}

export interface Experience {
  start_date: Date;
  end_date: Date;
  desc: string;
  company_id: string;
  company: Company;
}

interface Company {
  id: string;
  name: string;
}

export interface ProjectDto {
  project: Project;
}

export interface Project {
  id: string;
  proj_no: string;
  proj_name: string;
  region: string;
  scale_desc: string;
  data_level: string;
  proj_tech_kpis: { id: string }[];
  acceptance_filings: {
    proj_start_date: Date;
    af_date: Date;
  }[];
}
