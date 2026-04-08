/**
 * Servicio para imprimir en impresoras térmicas
 * Soporta impresoras térmicas comunes usando ESC/POS o comandos compatibles
 */

export const printService = {
  /**
   * Imprime un ticket en formato térmico (80mm o 58mm)
   * @param {Object} ticketData - Datos del ticket
   * @param {string} ticketData.ticketNumber - Número de entrada
   * @param {string} ticketData.movieTitle - Título de la película
   * @param {string} ticketData.screeningDate - Fecha de la función
   * @param {string} ticketData.screeningTime - Hora de la función
   * @param {string} ticketData.seatNumber - Número de asiento
   * @param {string} ticketData.price - Precio del ticket
   * @returns {Promise<boolean>}
   */
  async printThermalTicket(ticketData) {
    try {
      // Intenta usar la API del navegador para imprimir
      const printWindow = window.open('', '', 'width=400,height=600');
      
      if (!printWindow) {
        console.error('No se pudo abrir la ventana de impresión');
        return false;
      }

      const content = this.generateThermalHTML(ticketData);
      printWindow.document.write(content);
      printWindow.document.close();

      // Espera a que se cargue el contenido antes de imprimir
      printWindow.onload = () => {
        printWindow.print();
        // Cierra la ventana después de imprimir
        setTimeout(() => {
          printWindow.close();
        }, 1000);
      };

      return true;
    } catch (error) {
      console.error('Error al imprimir:', error);
      return false;
    }
  },

  /**
   * Imprime múltiples tickets (entrada grupal)
   * @param {Array} ticketsData - Array de datos de tickets
   * @returns {Promise<boolean>}
   */
  async printMultipleTickets(ticketsData) {
    try {
      const printWindow = window.open('', '', 'width=400,height=600');
      
      if (!printWindow) {
        console.error('No se pudo abrir la ventana de impresión');
        return false;
      }

      let html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            ${this.getThermalStyles()}
          </style>
        </head>
        <body>
      `;

      ticketsData.forEach((ticket, index) => {
        html += this.generateThermalTicketContent(ticket);
        if (index < ticketsData.length - 1) {
          html += '<div class="ticket-break"></div>';
        }
      });

      html += '</body></html>';

      printWindow.document.write(html);
      printWindow.document.close();

      printWindow.onload = () => {
        printWindow.print();
        setTimeout(() => {
          printWindow.close();
        }, 1000);
      };

      return true;
    } catch (error) {
      console.error('Error al imprimir múltiples tickets:', error);
      return false;
    }
  },

  /**
   * Genera el HTML para imprimir un ticket térmico individual
   * @private
   */
  generateThermalHTML(ticketData) {
    const content = this.generateThermalTicketContent(ticketData);
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          ${this.getThermalStyles()}
        </style>
      </head>
      <body>
        ${content}
      </body>
      </html>
    `;
  },

  /**
   * Genera el contenido HTML del ticket
   * @private
   */
  generateThermalTicketContent(ticket) {
    const date = new Date();
    const formattedDate = date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
      <div class="thermal-ticket">
        <div class="thermal-header">
          <div class="cinema-name">CINEA</div>
          <div class="cinema-subtitle">Cines Independientes</div>
        </div>

        <div class="thermal-divider">═══════════════════════════</div>

        <div class="thermal-section">
          <div class="thermal-label">PELÍCULA:</div>
          <div class="thermal-value bold">${this.truncateText(ticket.movieTitle || 'N/A', 32)}</div>
        </div>

        <div class="thermal-section">
          <div class="thermal-row">
            <div class="thermal-col">
              <div class="thermal-label">FECHA:</div>
              <div class="thermal-value">${ticket.screeningDate || 'N/A'}</div>
            </div>
            <div class="thermal-col">
              <div class="thermal-label">HORA:</div>
              <div class="thermal-value">${ticket.screeningTime || 'N/A'}</div>
            </div>
          </div>
        </div>

        <div class="thermal-section">
          <div class="thermal-label">ASIENTO:</div>
          <div class="thermal-value bold">${ticket.seatNumber || 'N/A'}</div>
        </div>

        <div class="thermal-section">
          <div class="thermal-label">ENTRADA:</div>
          <div class="thermal-barcode">${ticket.ticketNumber || 'N/A'}</div>
          <div class="thermal-code-small">${ticket.ticketNumber || 'N/A'}</div>
        </div>

        <div class="thermal-section">
          <div class="thermal-label">PRECIO:</div>
          <div class="thermal-value bold">${ticket.price || '0.00'} €</div>
        </div>

        <div class="thermal-divider">═══════════════════════════</div>

        <div class="thermal-footer">
          <div class="thermal-small">Impreso: ${formattedDate}</div>
          <div class="thermal-small">Presenta este código en la entrada</div>
          <div class="thermal-small">Válido solo para la función indicada</div>
        </div>

        <div class="thermal-divider">═══════════════════════════</div>
      </div>
    `;
  },

  /**
   * Estilos CSS para impresoras térmicas
   * @private
   */
  getThermalStyles() {
    return `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: 'Courier New', monospace;
        width: 72mm;
        max-width: 72mm;
        margin: 0 auto;
        padding: 1.5mm 0 0;
        background: white;
        color: #000;
      }

      @page {
        size: 80mm auto;
        margin: 1.5mm;
      }

      .thermal-ticket {
        width: 100%;
        padding: 1.5mm 1mm 2mm;
        text-align: center;
        font-size: 10pt;
        line-height: 1.2;
      }

      .thermal-header {
        margin-bottom: 3.2mm;
        padding-bottom: 2mm;
        border-bottom: 1px solid #000;
      }

      .cinema-name {
        font-size: 18pt;
        font-weight: bold;
        letter-spacing: 2px;
        margin-bottom: 2mm;
      }

      .cinema-subtitle {
        font-size: 8pt;
        color: #333;
      }

      .thermal-divider {
        text-align: center;
        font-size: 9pt;
        margin: 2mm 0;
        letter-spacing: 1px;
      }

      .thermal-section {
        margin: 2.2mm 0;
        text-align: left;
        padding: 0 0.8mm;
      }

      .thermal-label {
        font-size: 8pt;
        font-weight: bold;
        color: #333;
        margin-bottom: 1mm;
      }

      .thermal-value {
        font-size: 10pt;
        word-break: break-word;
      }

      .thermal-value.bold {
        font-weight: bold;
        font-size: 11pt;
      }

      .thermal-row {
        display: flex;
        gap: 2mm;
      }

      .thermal-col {
        flex: 1;
      }

      .thermal-barcode {
        font-family: 'Code 128', 'Courier New', monospace;
        font-size: 20pt;
        font-weight: bold;
        letter-spacing: 1.3px;
        margin: 1.2mm 0;
        word-break: break-all;
      }

      .thermal-code-small {
        font-size: 8pt;
        letter-spacing: 1px;
        word-break: break-all;
      }

      .thermal-footer {
        margin-top: 2.2mm;
        padding-top: 1.5mm;
        border-top: 1px solid #000;
      }

      .thermal-small {
        font-size: 8pt;
        color: #555;
        margin: 1mm 0;
      }

      .ticket-break {
        height: 3mm;
        page-break-after: always;
      }

      @media print {
        body {
          width: 72mm;
          max-width: 72mm;
          margin: 0 auto;
          padding: 0;
        }
      }
    `;
  },

  /**
   * Trunca texto a longitud máxima
   * @private
   */
  truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  },

  /**
   * Obtiene datos del ticket desde localStorage o parámetros
   * @param {string} ticketNumber - Número de ticket
   * @returns {Object}
   */
  getTicketData(ticketNumber) {
    // Intenta recuperar datos del localStorage
    const storedTickets = localStorage.getItem('tickets');
    if (storedTickets) {
      try {
        const tickets = JSON.parse(storedTickets);
        const ticket = tickets.find(t => t.ticketNumber === ticketNumber);
        if (ticket) return ticket;
      } catch (e) {
        console.error('Error al leer tickets del localStorage:', e);
      }
    }

    // Retorna datos básicos si no encuentra en localStorage
    return {
      ticketNumber: ticketNumber,
      movieTitle: 'Película',
      screeningDate: new Date().toLocaleDateString('es-ES'),
      screeningTime: '20:00',
      seatNumber: 'N/A',
      price: '10.00'
    };
  }
};
