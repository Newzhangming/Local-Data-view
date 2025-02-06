export interface CompanyUpdateReq {
  name: string;

  cert_office: string;

  // 统一社会信用代码
  social_credit_code: string;

  // 企业角色：设计，施工，监理, 勘察
  role_type: string;

  // 资质类别：建筑业企业资质，设计资质
  cert_type: string;

  // 资质编号
  cert_no: string;

  // 资质证书名称：建筑工程施工总承包特级
  cert_name: string;

  // 发证日期
  cert_date: Date;

  // 发证有效期
  cert_expire: Date;
}

export interface CompanyDto extends CompanyUpdateReq {
  id: string;

  // 更新时间
  updated_at: Date;

  managers: ManagerDto[];

  certificates: Certificate[];
}

export interface Certificate {
  id: string;
  cert_name: string;
  cert_no: string;
  cert_date: Date;
  cert_type: string;
  cert_expire: Date;
  cert_office: string;
}

export interface ManagerDto {
  manager: ManagerItem;
}

interface ManagerItem {
  id: string;
  name: string;
  id_card: string;
  cert_name: string;
}
