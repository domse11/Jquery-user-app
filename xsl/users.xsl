<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

    <xsl:template match="/">
        <div class="row">
            <xsl:for-each select="users/user">
                <div class="col-md-6 mb-3 user-card">
                    <div class="card">
                        <div class="card-body d-flex justify-content-between align-items-center">

                            <div>
                                <h5 class="card-title">
                                    <xsl:value-of select="name"/>
                                </h5>
                                <p class="card-text">
                                    <xsl:value-of select="email"/>
                                </p>
                            </div>

                            <button class="btn btn-sm btn-outline-warning favorite-btn" data-name="{name}">
                ☆
                            </button>

                        </div>
                    </div>
                </div>
            </xsl:for-each>
        </div>
    </xsl:template>

</xsl:stylesheet>
