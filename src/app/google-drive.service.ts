import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { KJUR } from 'jsrsasign';

@Injectable({
  providedIn: 'root'
})
export class GoogleDriveService {

  private serviceAccount = {
    "type": "service_account",
    "project_id": "bodanataliaydiego",
    "private_key_id": "a60883c5c38e2068facbc5db876911a704b68774",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCzQfQPlcq8w143\n+3p7ULkPVsxsI3PdGYjYoSR6sS6VSdx7UXfVD8+PM/sTjfZLKCHr2Q3P31nO+ZsX\ngYtOszu+5TF985LGMi511qhjSy3w58pI9hcxS3Gv1SGIXDgFDRuncLrUTV1OJjgB\nlS2bZNiXMvsveInsoIeGnZqEAq4hWBj4uzYxt7/MYlutYcREhOVwhNH16GWwj6//\nZEDvoBfP9U/JFgDSS/HohKZNvUQHQri4IJ92SvU6Ne9M7jhSt2jK/EkS057ne/oi\nyPSDdpZgbyqumVuU9XY0gFi55gRWl8+VAimqvc+n0e+8xgAHKmakg0z9i0N9NVV3\nZl0TjHsHAgMBAAECggEAMgrF7vnirJqfuWInebh5ySnyjHfDNySTOuKVc/j1p7CE\ncBq4qM6uo2wf+gAGE0ojWhtwiyjvgePVo5TDBpfrpGmITQCL52+H39aqkHmi3B9h\nLcghhl3o4WzO3Snda6+SmkZSqcTlONVbijmSj1ByVJdjXwe3/Up9OxvRUGwNH3po\nchVLCJLBeXVBcKaJ0CXswi3lEgTkr//Wb0qLd8X7iDuYB5bNQ3JsUtuerYzF5qLG\nNYJhmgw9uPV9vkyw+RuRKezUkkdHKow3i8FXT7b93Ku7uH8Fax0zP5iryyC4Egr/\nFzcdpVTXHGcOSJWpqek5RejhvX0jcr8oArGajex8oQKBgQDaID+09auPLDXyiia9\nGRQWLRWtPVTkJuJtQJh7/FeLL2njwiczvhcruf2wOERtJ3xnJBPqngP0Z7qIP3CM\nb/AKH5ucx1BX06q2LY2V3BnySFmyFeRcB2tQDfgnM0jgw3e1DGbCIwCCW1wWQWK6\n9yzHfHKP03KG/ow0JAvZQ3pHJwKBgQDSYf9ck3gCMg5iWkGloBJpExve2cDBQROI\nbRukV+PnZolyA2i4S+v11+Ln0riwGFuiisHhQhAdIhxFiVxLpCQICrrMgRQH7LXD\nCc86SVP1Iu0+fxOL/mwt0j4Dgdz6HkQY9qe/bMh4AeYfcxdJdkqiSC7bD64yvXbv\neO3KI4WZIQKBgDRMIRohANYd8n1JVEpoVeGPQ7A6kTz2eblaEHVBpjev0YKTDVUh\nkWqheEqk4vsMyY3tH31UD3ys1hNOqoxxVisHMwce3ouAK2DsgRLaJ7poUGEbUJok\nCT2za7jyWdnR48SbyZNoUvnuL6ECYkqTcsANfWYwezgUlcb2kYSw4gNnAoGAQW95\nnbHAge5PyweHo5xGHahz4ryX14QGL0jAcD1mBXM/DNdCmxACNFURnklMaHkrB0Nh\nSk7h9C3H3Vj7/Arxqg6sSy9aq5xUbHWAnwBvvK9AW0/rJH/d5eKepzidIq6HP7x4\nMHIFaE4u5VlGxPKmBBOvfzNBW0bS12kljNm/lAECgYEArYKrk6wWJhEHrVdLkq6x\nkU26gsqLR5oL4F6cuWaS2zC9Jq6yN+vlHfLf1HqIzeu7y7hGLJW339wsf3Fri9e3\nbkZnn532cnHusrZa9aa3mcQtjV3qi+O3AhJ44p2X57t+9Z3lB9X5v7iMxW95mcvv\nbAj6Q8goOFX7jbXZJcCQPew=\n-----END PRIVATE KEY-----\n",
    "client_email": "bodanataliaydiego@bodanataliaydiego.iam.gserviceaccount.com",
    "client_id": "104013589520569639693",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/bodanataliaydiego%40bodanataliaydiego.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
  }
  ;

  // ID de la carpeta de Google Drive donde se subirán los archivos
  private folderId: string = '1EmJNQHI1kie8K5AINlpaIy6iJHCQE5m3';

  constructor(private http: HttpClient) { }

  /**
   * Genera un JWT firmado con la clave privada de la cuenta de servicio.
   */
  private generateJWT(): string {
    const header = { alg: 'RS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: this.serviceAccount.client_email,
      scope: 'https://www.googleapis.com/auth/drive.file',
      aud: this.serviceAccount.token_uri,
      exp: now + 3600, // Token válido por 1 hora
      iat: now
    };

    const sHeader = JSON.stringify(header);
    const sPayload = JSON.stringify(payload);
    // Se firma el JWT usando la clave privada.
    const jwt = KJUR.jws.JWS.sign('RS256', sHeader, sPayload, this.serviceAccount.private_key);
    return jwt;
  }

  /**
   * Solicita un token de acceso a partir del JWT generado.
   */
  private getAccessToken(): Observable<string> {
    const jwt = this.generateJWT();

    // Se construye el cuerpo de la petición en formato x-www-form-urlencoded.
    const body = new URLSearchParams();
    body.set('grant_type', 'urn:ietf:params:oauth:grant-type:jwt-bearer');
    body.set('assertion', jwt);

    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    return this.http.post<any>(this.serviceAccount.token_uri, body.toString(), { headers }).pipe(
      map(response => response.access_token)
    );
  }

  /**
   * Sube el archivo a Google Drive usando el endpoint de subida multipart.
   */
  uploadFile(file: File): Observable<any> {
    // Metadata del archivo a subir, incluyendo el nombre y la carpeta destino
    const metadata = {
      name: file.name,
      parents: [this.folderId]
    };

    // Se crea un FormData y se adjunta la metadata y el archivo.
    const formData: FormData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    formData.append('file', file);

    const uploadUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

    // Primero se obtiene el token de acceso y luego se realiza la subida.
    return this.getAccessToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });
        return this.http.post(uploadUrl, formData, { headers });
      })
    );
  }
}
