import { ShaderMaterial, ShaderMaterialParameters } from "three"

class CusBasicMaterial extends ShaderMaterial {
  constructor(parameters: ShaderMaterialParameters) {
    super(parameters)
  }
}

export {CusBasicMaterial}