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
  id_card: string;
  cert_name: string;
  cert_status: string;
  projects: Project[];
  experiences: Experience[];
  created_at: Date;
}

export interface Experience {
  start_date: Date;
  end_date: Date;
  desc: string;
  company_id: string;
  company: Company;
}

interface Company {
  name: string;
}

interface Project {
  id: string;
  proj_name: string;
}
