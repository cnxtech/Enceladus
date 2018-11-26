import './x-countdown';
import { LitElement, html, customElement, property } from '@polymer/lit-element';
import { sealed, role } from '../helpers/decorators';
import { TemplateResult } from 'lit-html';

@sealed
@customElement('x-header' as any)
@role('region')
export class Header extends LitElement {
  public render(): TemplateResult {
    return html`
      <link rel='stylesheet' href='x-header.bundle.css'>
      <div role='header' aria-description='launch name'>${this.launch_name}</div>
      <x-countdown .t0='${this.t0}'></x-countdown>
    `;
  }

  @property({ attribute: false }) public launch_name = '';
  @property({ attribute: false }) public t0: Nullable<number> = null;
}
