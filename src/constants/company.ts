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
  cert_date: string;

  // 发证有效期
  cert_expire: string;
}

export interface CompanyDto extends CompanyUpdateReq {
  id: string;

  // 更新时间
  updated_at: string;

  managers: ManagerDto[];
}

interface ManagerDto {
  manager: ManagerItem;
}

interface ManagerItem {
  name: string;
  id_card: string;
}
