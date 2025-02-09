export interface ManagerUpdateReq {
  id: string;
  name: string;
  id_card: string;
  cert_name?: string;
  cert_status?: string;
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
  projects: Project[];
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

export interface Project {
  id: string;
  proj_no: string;
  proj_name: string;
  region: string;
  acceptance_filings: {
    proj_start_date: Date;
    af_date: Date;
  }[];
}
